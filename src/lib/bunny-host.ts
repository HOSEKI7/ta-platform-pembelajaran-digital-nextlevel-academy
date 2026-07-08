/** Bunny CDN hostname read from env. Falls back to empty string. */
export const BUNNY_CDN_HOST = process.env.BUNNY_STORAGE_PULL_ZONE ?? "";
