import { execSync } from "node:child_process";

try {
  execSync("npm run resume:sync -- --auto", { stdio: "inherit" });
} catch (error) {
  const code = error?.status ?? 1;
  if (code === 2) {
    console.warn(
      "[prebuild] Resume sync requires review. Building with last validated content.",
    );
    process.exit(0);
  }
  process.exit(code);
}