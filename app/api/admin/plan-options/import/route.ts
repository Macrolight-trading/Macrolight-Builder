import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Minimal RFC 4180-ish CSV parser. Handles quoted fields, embedded commas,
// escaped quotes ("" inside a quoted field), CRLF/LF line endings, and
// trailing newlines. No streaming — fine for the small files this page expects.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  let i = 0;
  const n = text.length;

  // Strip a UTF-8 BOM if present (Excel adds one).
  if (text.charCodeAt(0) === 0xfeff) i = 1;

  while (i < n) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ",") {
      row.push(field);
      field = "";
      i++;
      continue;
    }
    if (ch === "\r") {
      // swallow — handle on \n
      i++;
      continue;
    }
    if (ch === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      i++;
      continue;
    }
    field += ch;
    i++;
  }

  // flush last field/row if there's no trailing newline
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ""));
}

type BillingType = "ONE_TIME" | "MONTHLY";

function normalizeBilling(raw: string): BillingType | null {
  const v = raw.trim().toLowerCase().replace(/[\s-]/g, "_");
  if (v === "monthly" || v === "month" || v === "recurring") return "MONTHLY";
  if (v === "one_time" || v === "onetime" || v === "once" || v === "flat") return "ONE_TIME";
  return null;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (raw == null) return fallback;
  const v = raw.trim().toLowerCase();
  if (v === "") return fallback;
  if (["true", "yes", "y", "1", "active"].includes(v)) return true;
  if (["false", "no", "n", "0", "inactive"].includes(v)) return false;
  return fallback;
}

function parsePriceToCents(raw: string): number | null {
  if (!raw) return null;
  // Allow "$199", "199.00", "1,200.50", etc.
  const cleaned = raw.replace(/[$\s,]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  const dollars = parseFloat(cleaned);
  if (!Number.isFinite(dollars) || dollars < 0) return null;
  return Math.round(dollars * 100);
}

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as { role?: string } | undefined)?.role;
  return role === "ADMIN" ? session : null;
}

type RowResult = {
  row: number; // 1-indexed, excluding header
  status: "created" | "updated" | "error";
  name?: string;
  error?: string;
};

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let csvText: string;
  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded under field 'file'." }, { status: 400 });
    }
    csvText = await (file as File).text();
  } else if (contentType.includes("text/csv") || contentType.includes("text/plain")) {
    csvText = await req.text();
  } else {
    return NextResponse.json(
      { error: "Send a CSV either as multipart/form-data (field 'file') or text/csv body." },
      { status: 415 },
    );
  }

  if (!csvText.trim()) {
    return NextResponse.json({ error: "CSV is empty." }, { status: 400 });
  }

  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return NextResponse.json(
      { error: "CSV must include a header row and at least one data row." },
      { status: 400 },
    );
  }

  // Normalize header — lowercase, strip whitespace.
  const header = rows[0].map((h) => h.trim().toLowerCase());

  const required = ["name", "category", "price", "billingtype"];
  const missing = required.filter((c) => !header.includes(c));
  if (missing.length > 0) {
    return NextResponse.json(
      {
        error: `Missing required columns: ${missing.join(", ")}. Expected at minimum: name, category, price, billingType.`,
      },
      { status: 400 },
    );
  }

  const idx = {
    name: header.indexOf("name"),
    description: header.indexOf("description"),
    category: header.indexOf("category"),
    price: header.indexOf("price"),
    billingType: header.indexOf("billingtype"),
    active: header.indexOf("active"),
    sortOrder: header.indexOf("sortorder"),
  };

  const results: RowResult[] = [];
  let created = 0;
  let updated = 0;
  let errored = 0;

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    const rowNum = r; // 1-indexed data row number

    const name = (cells[idx.name] ?? "").trim();
    const category = (cells[idx.category] ?? "").trim();
    const priceRaw = (cells[idx.price] ?? "").trim();
    const billingRaw = (cells[idx.billingType] ?? "").trim();
    const description =
      idx.description >= 0 ? (cells[idx.description] ?? "").trim() : "";
    const activeRaw = idx.active >= 0 ? cells[idx.active] : undefined;
    const sortOrderRaw =
      idx.sortOrder >= 0 ? (cells[idx.sortOrder] ?? "").trim() : "";

    if (!name) {
      results.push({ row: rowNum, status: "error", error: "Missing name." });
      errored++;
      continue;
    }
    if (!category) {
      results.push({ row: rowNum, status: "error", name, error: "Missing category." });
      errored++;
      continue;
    }

    const priceCents = parsePriceToCents(priceRaw);
    if (priceCents == null) {
      results.push({
        row: rowNum,
        status: "error",
        name,
        error: `Invalid price "${priceRaw}". Use a number in dollars, e.g. 199 or 199.00.`,
      });
      errored++;
      continue;
    }

    const billingType = normalizeBilling(billingRaw);
    if (!billingType) {
      results.push({
        row: rowNum,
        status: "error",
        name,
        error: `Invalid billingType "${billingRaw}". Use "monthly" or "one-time".`,
      });
      errored++;
      continue;
    }

    const active = parseBool(activeRaw, true);
    const sortOrder = sortOrderRaw === "" ? 0 : Number(sortOrderRaw);
    if (!Number.isFinite(sortOrder)) {
      results.push({
        row: rowNum,
        status: "error",
        name,
        error: `Invalid sortOrder "${sortOrderRaw}".`,
      });
      errored++;
      continue;
    }

    // Upsert by (name, category). There's no DB-level unique constraint on
    // that pair so we do a lookup-then-write rather than prisma.upsert().
    try {
      const existing = await prisma.planOption.findFirst({
        where: { name, category },
        select: { id: true },
      });

      if (existing) {
        await prisma.planOption.update({
          where: { id: existing.id },
          data: {
            description: description || null,
            priceCents,
            billingType,
            active,
            sortOrder: Math.trunc(sortOrder),
          },
        });
        results.push({ row: rowNum, status: "updated", name });
        updated++;
      } else {
        await prisma.planOption.create({
          data: {
            name,
            description: description || null,
            category,
            priceCents,
            billingType,
            active,
            sortOrder: Math.trunc(sortOrder),
          },
        });
        results.push({ row: rowNum, status: "created", name });
        created++;
      }
    } catch (e) {
      results.push({
        row: rowNum,
        status: "error",
        name,
        error: e instanceof Error ? e.message : "Database error.",
      });
      errored++;
    }
  }

  return NextResponse.json({
    summary: {
      total: rows.length - 1,
      created,
      updated,
      errored,
    },
    results,
  });
}
