import { cp, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const target = await mkdtemp(join(tmpdir(), "croze-checkoutco-"));
const excluded = new Set([".git", "dist", "node_modules"]);

await cp(repositoryRoot, target, {
  recursive: true,
  filter(source) {
    if (source === repositoryRoot) {
      return true;
    }
    return !excluded.has(basename(source));
  },
});

console.log(`Fresh baseline created at:\n${target}`);
