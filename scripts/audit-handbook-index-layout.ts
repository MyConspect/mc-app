import "./load-env";
import {
  auditHandbookIndexLayoutPolicy,
  formatHandbookIndexLayoutReport,
} from "../lib/audit/handbookIndexLayoutPolicy";

function main(): void {
  const violations = auditHandbookIndexLayoutPolicy();
  const report = formatHandbookIndexLayoutReport(violations);
  process.stdout.write(`${report}\n`);
  if (violations.length > 0) {
    process.exit(1);
  }
}

main();