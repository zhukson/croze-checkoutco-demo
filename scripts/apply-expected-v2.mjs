import { cp, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const targetRoot = resolve(process.argv[2] ?? "");
const expectedRoot = resolve(repositoryRoot, "fixtures", "expected-v2");
const changedFiles = [
  "package.json",
  "package-lock.json",
  "src/checkout.ts",
  "src/order-state.ts",
  "src/refund.ts",
  "src/webhook.ts",
];

if (!process.argv[2]) {
  throw new Error("Usage: node scripts/apply-expected-v2.mjs <demo-copy>");
}

if (targetRoot === repositoryRoot) {
  throw new Error("Refusing to modify the source repository. Create a demo copy first.");
}

for (const path of changedFiles) {
  const [baseline, target] = await Promise.all([
    readFile(resolve(repositoryRoot, path)),
    readFile(resolve(targetRoot, path)),
  ]);

  if (!baseline.equals(target)) {
    throw new Error(`Refusing to overwrite modified target file: ${path}`);
  }
}

for (const path of changedFiles) {
  await cp(resolve(expectedRoot, path), resolve(targetRoot, path));
}

console.log(`Applied AcmePay v2 to ${relative(process.cwd(), targetRoot)}`);
console.log(`Changed exactly ${changedFiles.length} files:`);
for (const path of changedFiles) {
  console.log(`- ${path}`);
}
