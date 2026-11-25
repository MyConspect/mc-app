import "./load-env";
import {
  auditInterviewAnchorParity,
  formatInterviewAnchorReport,
} from "../lib/audit/interviewAnchorParity";

function main(): void {
  const strict = process.argv.includes("--strict");
  const mismatches = auditInterviewAnchorParity();
  const report = formatInterviewAnchorReport(mismatches);
  process.stdout.write(`${report}\n`);
  if (strict && mismatches.length > 0) {
    process.exit(1);
  }
}

main();