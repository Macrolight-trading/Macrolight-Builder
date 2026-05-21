import OldHomePage from "@/components/home/OldHomePage";
import NewHomePage from "@/components/home/NewHomePage";

/**
 * Runtime feature flag for the home page redesign.
 *
 * Flip this to `true` to render the new (Framer Motion + premium-minimal)
 * design. Flip back to `false` to instantly revert to the original live
 * design — no data loss, no rebuild, just a one-character change.
 *
 * Both versions are kept under components/home/. The old version is
 * preserved verbatim and should not be edited; iterate on the new
 * version in components/home/NewHomePage.tsx.
 *
 * When ready to make the redesign permanent, leave this on `true`,
 * verify in production, and then (optionally) delete the old files.
 */
const USE_NEW_HOMEPAGE = true;

export default function HomePage() {
  return USE_NEW_HOMEPAGE ? <NewHomePage /> : <OldHomePage />;
}
