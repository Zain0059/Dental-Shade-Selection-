import { runAllRegressionTests } from "./regressionTests";

console.log("=================================================");
console.log("DENTAL SHADE AI & COLORIMETRY REGRESSION TEST RUN");
console.log("=================================================\n");

const summary = runAllRegressionTests();

summary.results.forEach((res, i) => {
  const symbol = res.passed ? "✓ PASS" : "✗ FAIL";
  console.log(`[${symbol}] [${res.suite}] ${res.name}`);
  console.log(`       Message: ${res.message} (${res.durationMs.toFixed(2)}ms)`);
});

console.log("\n-------------------------------------------------");
console.log(`TOTAL: ${summary.total} | PASSED: ${summary.passed} | FAILED: ${summary.failed}`);
console.log("-------------------------------------------------");

if (summary.failed > 0) {
  console.error(`\nTest suite FAILED with ${summary.failed} errors.`);
  process.exit(1);
} else {
  console.log("\nAll clinical colorimetry & lifecycle regression tests PASSED.");
  process.exit(0);
}
