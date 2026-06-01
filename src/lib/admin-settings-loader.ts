import "server-only";

/**
 * Server loader for the admin "Pengaturan" page (PRD §6.11.11).
 *
 * The platform-info read now lives in the neutral `@/lib/platform-info` module
 * (shared with the public landing surface). Re-exported here so existing admin
 * imports keep working.
 */

export { PLATFORM_INFO_KEY, loadPlatformInfo } from "@/lib/platform-info";
