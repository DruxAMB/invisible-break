#!/usr/bin/env node
/**
 * Invisible Break Watcher
 *
 * Runs Kane CLI testmd flows against the local app, parses the NDJSON output,
 * and generates agent-ready failure reports when breaks are detected.
 *
 * Usage:
 *   npx tsx watcher/index.ts              # run once
 *   npx tsx watcher/index.ts --watch      # watch for file changes
 */

import { FileWatcher } from "./file-watcher";
import { KaneWatcher } from "./kane-watcher";

const args = process.argv.slice(2);
const watchMode = args.includes("--watch");
const runOnce = args.includes("--run") || !watchMode;

async function main() {
  console.log("=== Invisible Break Watcher ===");
  console.log(`Mode: ${watchMode ? "watch" : "run-once"}`);
  console.log("");

  if (watchMode) {
    const fileWatcher = new FileWatcher({
      onResult: (result) => {
        console.log(`\n[Result] ${result.overallStatus} (${result.duration}s, ${result.creditsConsumed.toFixed(2)} credits)`);
        if (result.bugVerdict) {
          console.log(`[Bug] ${result.bugVerdict.bug_title} (confidence: ${(result.bugVerdict.confidence * 100).toFixed(0)}%)`);
        }
      },
      onStatus: (status) => {
        console.log(`[Status] ${status}`);
      },
    });

    fileWatcher.start();

    // Keep process alive
    process.on("SIGINT", () => {
      console.log("\n[Watcher] Shutting down...");
      fileWatcher.stop();
      process.exit(0);
    });

    console.log("\n[Watcher] Running initial verification...");
    await fileWatcher.triggerRun();
    console.log("[Watcher] Now watching for file changes. Press Ctrl+C to stop.\n");
  } else if (runOnce) {
    const kane = new KaneWatcher();
    console.log("[Watcher] Running Kane verification...");
    const result = await kane.run();

    console.log(`\n[Result] ${result.overallStatus.toUpperCase()}`);
    console.log(`Duration: ${result.duration}s`);
    console.log(`Credits: ${result.creditsConsumed.toFixed(2)}`);

    if (result.bugVerdict) {
      console.log(`\n[Bug Verdict]`);
      console.log(`  Title: ${result.bugVerdict.bug_title}`);
      console.log(`  Category: ${result.bugVerdict.family}/${result.bugVerdict.category}`);
      console.log(`  Severity: ${result.bugVerdict.severity}`);
      console.log(`  Confidence: ${(result.bugVerdict.confidence * 100).toFixed(0)}%`);
      console.log(`  Root cause: ${result.bugVerdict.root_cause}`);
      console.log(`  Suggestion: ${result.bugVerdict.suggestion}`);

      if (result.bugVerdict.signals.length > 0) {
        console.log(`\n[Evidence]`);
        for (const signal of result.bugVerdict.signals) {
          console.log(`  [${signal.type}] ${signal.excerpt}`);
        }
      }

      const reportPath = kane.saveFailureReport(result);
      if (reportPath) {
        console.log(`\n[Failure Report] Saved to: ${reportPath}`);
        console.log("The agent can read this file and fix the code.");
      }
    }

    if (result.shareUrl) {
      console.log(`\n[Kane Dashboard] ${result.shareUrl}`);
    }

    process.exit(result.overallStatus === "passed" ? 0 : 1);
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
