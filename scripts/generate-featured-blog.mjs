#!/usr/bin/env node
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Snapshots the featured posts into the bundle at build time so the landing
 * page renders them with no API call at all. A failed fetch is not a failed
 * build — the previously committed snapshot stays in place.
 */

const FEATURED_COUNT = 4;
const OUTPUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../src/features/blog/generated/featured-posts.json",
);

const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, "");

async function main() {
  if (!apiUrl) {
    console.warn("[blog] NEXT_PUBLIC_API_URL not set — keeping existing snapshot.");
    return;
  }

  const response = await fetch(
    `${apiUrl}/api/v1/public/blog/featured?limit=${FEATURED_COUNT}`,
    { signal: AbortSignal.timeout(15000) },
  );
  if (!response.ok) throw new Error(`API responded ${response.status}`);

  const payload = await response.json();
  const posts = payload?.data ?? [];
  if (!Array.isArray(posts)) throw new Error("Unexpected payload shape");

  await mkdir(dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
  console.log(`[blog] Snapshotted ${posts.length} featured post(s).`);
}

main().catch((error) => {
  console.warn(`[blog] Snapshot skipped — keeping committed copy. (${error.message})`);
});
