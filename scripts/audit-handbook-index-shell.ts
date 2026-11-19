import "./load-env";
import {
  auditHandbookIndexShell,
  formatHandbookIndexShellReport,
} from "../lib/audit/handbookIndexShell";

function main(): void {
  const violations = auditHandbookIndexShell();
  const report = formatHandbookIndexShellReport(violations);
  process.stdout.write(`${report}\n`);
  if (violations.length > 0) {
    process.exit(1);
  }
}

main();