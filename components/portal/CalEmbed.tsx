"use client";

import { useEffect } from "react";
import Cal, { getCalApi } from "@calcom/embed-react";

/**
 * Inline Cal.com booking embed for /portal/book-a-call.
 *
 * Renders the booking widget inline (not a popup) so it lives natively in
 * the portal layout. Pre-fills the user's name + email so they don't have
 * to retype them, and styles the embed to match our violet brand.
 *
 * The actual Cal.com link is derived from NEXT_PUBLIC_CAL_USERNAME and
 * NEXT_PUBLIC_CAL_EVENT_SLUG — see CAL_SETUP.md.
 */
export default function CalEmbed({
  calLink,
  name,
  email,
  notes,
}: {
  /** e.g. "bradley-bayley/strategy-call". */
  calLink: string;
  name?: string;
  email?: string;
  /** Pre-fills the "Additional notes" field on the booking form. */
  notes?: string;
}) {
  useEffect(() => {
    (async () => {
      const cal = await getCalApi();
      cal("ui", {
        theme: "light",
        cssVarsPerTheme: {
          light: {
            "cal-brand": "#7c3aed",
          },
        },
        hideEventTypeDetails: false,
        layout: "month_view",
      });
    })();
  }, []);

  return (
    <div className="w-full">
      <Cal
        calLink={calLink}
        style={{ width: "100%", height: "100%", minHeight: "640px" }}
        config={{
          layout: "month_view",
          // Pre-fill — Cal.com hides these fields on the booking form when
          // they arrive as URL params, so the user only sees what's still
          // needed.
          name: name ?? "",
          email: email ?? "",
          notes: notes ?? "",
        }}
      />
    </div>
  );
}
