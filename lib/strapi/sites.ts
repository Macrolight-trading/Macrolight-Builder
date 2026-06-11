import type { StrapiSite } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  generatePairingKey,
  hashPairingKey,
  parsePairingPrefix,
  readPairingKey,
  safeEqualHex,
} from "./keys";

/**
 * Service helpers for Builder-side Strapi integration records.
 *
 * The Builder app is the control plane: it owns each client site's Strapi
 * connection + pairing metadata here, while business/workflow data stays in the
 * existing models. Sibling apps never touch this table directly — they pair via
 * `authenticatePairingRequest` and read the minimal payload from `toPairingPayload`.
 */

export type StrapiSiteInput = {
  name: string;
  slug: string;
  userId?: string | null;
  projectId?: string | null;
  strapiBaseUrl?: string | null;
  strapiSpaceId?: string | null;
  strapiCollection?: string | null;
  status?: StrapiSite["status"];
  notes?: string | null;
};

/** Admin-facing view of a site — never includes the secret hash. */
export type AdminStrapiSite = Omit<StrapiSite, "pairingKeyHash"> & {
  hasPairingKey: boolean;
};

/** Minimal, safe payload returned to an external app on a successful pairing. */
export type PairingPayload = {
  siteId: string;
  slug: string;
  name: string;
  userId: string | null;
  projectId: string | null;
  strapiBaseUrl: string | null;
  strapiSpaceId: string | null;
  strapiCollection: string | null;
  status: StrapiSite["status"];
};

function normalizeSlug(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function toAdminSite(site: StrapiSite): AdminStrapiSite {
  const { pairingKeyHash, ...rest } = site;
  return { ...rest, hasPairingKey: Boolean(pairingKeyHash) };
}

export function toPairingPayload(site: StrapiSite): PairingPayload {
  return {
    siteId: site.id,
    slug: site.slug,
    name: site.name,
    userId: site.userId,
    projectId: site.projectId,
    strapiBaseUrl: site.strapiBaseUrl,
    strapiSpaceId: site.strapiSpaceId,
    strapiCollection: site.strapiCollection,
    status: site.status,
  };
}

export async function listSites(): Promise<AdminStrapiSite[]> {
  const sites = await prisma.strapiSite.findMany({ orderBy: { createdAt: "desc" } });
  return sites.map(toAdminSite);
}

export async function getSite(id: string): Promise<AdminStrapiSite | null> {
  const site = await prisma.strapiSite.findUnique({ where: { id } });
  return site ? toAdminSite(site) : null;
}

/**
 * Create or update a site. When `id` is provided the record is updated;
 * otherwise the slug is the natural key and an existing slug is updated in place
 * (idempotent, same spirit as the project upsert in the admin portal).
 */
export async function upsertSite(
  input: StrapiSiteInput,
  id?: string
): Promise<AdminStrapiSite> {
  const slug = normalizeSlug(input.slug);
  const data = {
    name: input.name.trim(),
    slug,
    userId: input.userId?.trim() || null,
    projectId: input.projectId?.trim() || null,
    strapiBaseUrl: input.strapiBaseUrl?.trim() || null,
    strapiSpaceId: input.strapiSpaceId?.trim() || null,
    strapiCollection: input.strapiCollection?.trim() || null,
    notes: input.notes?.trim() || null,
    ...(input.status ? { status: input.status } : {}),
  };

  if (id) {
    const updated = await prisma.strapiSite.update({ where: { id }, data });
    return toAdminSite(updated);
  }

  const site = await prisma.strapiSite.upsert({
    where: { slug },
    create: { ...data, status: input.status ?? "PENDING" },
    update: data,
  });
  return toAdminSite(site);
}

/**
 * Generate (or regenerate) the pairing key for a site. Returns the admin view
 * plus the plaintext token, which is shown to the admin exactly once and never
 * persisted.
 */
export async function rotatePairingKey(
  id: string
): Promise<{ site: AdminStrapiSite; token: string }> {
  const key = generatePairingKey();
  const updated = await prisma.strapiSite.update({
    where: { id },
    data: {
      pairingKeyHash: key.hash,
      pairingKeyPrefix: key.prefix,
      pairingKeyLast4: key.last4,
      pairingKeyRotatedAt: new Date(),
    },
  });
  return { site: toAdminSite(updated), token: key.token };
}

export type PairingAuthResult =
  | { ok: true; site: StrapiSite }
  | { ok: false; status: 401 | 403 };

/**
 * Validate an inbound, key-authenticated pairing request from an external app.
 *
 * 1. Read the key from `x-macrolight-key` (or a Bearer token).
 * 2. Look the site up by its non-secret prefix (indexed, O(1)).
 * 3. Verify the full key with a constant-time hash comparison.
 * 4. Reject DISABLED sites with 403; everything unauthenticated is 401.
 *
 * Does not mutate state — call `markPaired` after a successful pair if you want
 * to record the timestamp.
 */
export async function authenticatePairingRequest(req: {
  headers: { get(name: string): string | null };
}): Promise<PairingAuthResult> {
  const token = readPairingKey(req);
  const prefix = parsePairingPrefix(token);
  if (!token || !prefix) return { ok: false, status: 401 };

  const site = await prisma.strapiSite.findUnique({
    where: { pairingKeyPrefix: prefix },
  });
  if (!site || !site.pairingKeyHash) return { ok: false, status: 401 };

  const presentedHash = hashPairingKey(token);
  if (!safeEqualHex(presentedHash, site.pairingKeyHash)) {
    return { ok: false, status: 401 };
  }

  if (site.status === "DISABLED") return { ok: false, status: 403 };

  return { ok: true, site };
}

/**
 * Stamp a successful pairing. A working pair promotes the site to ACTIVE (it is
 * demonstrably reachable); DISABLED sites never reach here.
 */
export async function markPaired(id: string): Promise<void> {
  await prisma.strapiSite.update({
    where: { id },
    data: { lastPairedAt: new Date(), status: "ACTIVE" },
  });
}
