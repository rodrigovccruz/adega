import { execSync } from "node:child_process";

const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://adega:adega@localhost:5432/adega_test?schema=public";

export default function globalSetup() {
  try {
    execSync("createdb -h localhost -U adega adega_test", {
      env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD ?? "adega" },
      stdio: "pipe",
    });
  } catch {
    // banco de teste já existe — ok
  }

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });
}
