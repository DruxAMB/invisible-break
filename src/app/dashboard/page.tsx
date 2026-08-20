"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

type WatcherState = {
  status: "idle" | "running" | "passed" | "failed";
  lastResult: RunResult | null;
  failureReportPath?: string;
};

type RunResult = {
  status: string;
  overallStatus: "passed" | "failed";
  duration: number;
  creditsConsumed: number;
  sessionId: string;
  shareUrl?: string;
  evidencePath?: string;
  bugVerdict?: BugVerdict;
  steps: StepResult[];
  timestamp: string;
  testFile: string;
};

type BugVerdict = {
  confirmed: boolean;
  bug_title: string;
  family: string;
  category: string;
  severity: string;
  confidence: number;
  one_liner: string;
  root_cause: string;
  suggestion: string;
  signals: EvidenceSignal[];
};

type EvidenceSignal = {
  type: string;
  excerpt: string;
  step?: string;
};

type StepResult = {
  index: number;
  heading: string;
  status: string;
  duration: number;
};

export default function DashboardPage() {
  const [state, setState] = useState<WatcherState>({
    status: "idle",
    lastResult: null,
  });
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const resp = await fetch("/api/watcher/status");
      if (resp.ok) {
        const data = await resp.json();
        setState(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const triggerRun = async () => {
    setError(null);
    setPolling(true);
    try {
      const resp = await fetch("/api/watcher/run", { method: "POST" });
      if (!resp.ok) {
        const data = await resp.json();
        setError(data.detail ?? "Failed to start run");
      }
    } catch (err) {
      setError(String(err));
    }
    setPolling(false);
  };

  const isRunning = state.status === "running";
  const result = state.lastResult;
  const hasFailures = result?.overallStatus === "failed";
  const bugVerdict = result?.bugVerdict;

  return (
    <div className="min-h-screen bg-studio-charcoal text-bone-white">
      {/* Navigation */}
      <header className="px-6 py-6">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-gt-flexa text-base font-normal text-bone-white">
              <span className="text-ember-orange">●</span> QuantumStore
            </Link>
            <span className="font-gt-flexa text-sm text-ash-gray">/</span>
            <span className="font-gt-flexa text-sm text-ash-gray">Invisible Break</span>
          </div>
          <Link
            href="/"
            className="rounded-[20px] border border-lavender-link px-4 py-2 font-gt-flexa text-sm font-normal text-lavender-link transition hover:bg-lavender-link/10"
          >
            ← Store
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-6 py-16">
        {/* Hero — left-aligned */}
        <div className="mb-16">
          <h1 className="mb-4 font-gt-flexa text-[68px] font-extralight leading-[1.06] text-bone-white">
            Verification
          </h1>
          <p className="max-w-lg font-times text-base leading-[1.2] text-ash-gray">
            Kane CLI runs flows with DevTools assertions — catching what screenshots miss.
          </p>
        </div>

        {/* Status bar — one ember CTA */}
        <div className="mb-12 flex items-center justify-between rounded-[20px] border border-ash-gray/40 p-6">
          <div className="flex items-center gap-4">
            <div
              className={`h-3 w-3 rounded-full ${
                isRunning
                  ? "animate-pulse bg-ember-orange"
                  : state.status === "passed"
                  ? "bg-bone-white"
                  : state.status === "failed"
                  ? "bg-ember-orange"
                  : "bg-ash-gray"
              }`}
            />
            <div>
              <div className="font-gt-flexa text-base font-normal text-bone-white">
                {isRunning
                  ? "Running verification..."
                  : state.status === "passed"
                  ? "All checks passed"
                  : state.status === "failed"
                  ? `${bugVerdict?.signals.length ?? 0} invisible break${(bugVerdict?.signals.length ?? 0) > 1 ? "s" : ""} found`
                  : "Idle — click Run to verify"}
              </div>
              {result && (
                <div className="font-gt-flexa text-sm font-normal text-ash-gray">
                  Last run: {result.duration}s · {result.creditsConsumed.toFixed(2)} credits · {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          {/* Single ember CTA per viewport */}
          <button
            onClick={triggerRun}
            disabled={isRunning || polling}
            className="rounded-[20px] bg-ember-orange px-4 py-px font-gt-flexa text-base font-normal text-bone-white shadow-[0_0_30px_rgba(245,86,0,0.6)] transition hover:bg-ember-orange/90 disabled:opacity-40"
          >
            {isRunning ? "Running..." : "Run Verification"}
          </button>
        </div>

        {error && (
          <div className="mb-8 rounded-[20px] border border-ash-gray/40 px-6 py-4">
            <p className="font-gt-flexa text-sm font-normal text-bone-white">{error}</p>
          </div>
        )}

        {/* Failure cards */}
        {hasFailures && bugVerdict && (
          <div className="mb-12">
            <h2 className="mb-6 font-tobias-light text-[42px] font-normal uppercase tracking-[-0.062em] text-bone-white">
              Invisible Breaks Detected
            </h2>
            <div className="space-y-4">
              {bugVerdict.signals.map((signal, i) => (
                <div
                  key={i}
                  className="rounded-[20px] border border-ash-gray/40 p-6"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span className="rounded-[20px] border border-ash-gray/40 px-3 py-1 font-gt-flexa text-xs font-normal text-bone-white">
                      {signal.type}
                    </span>
                    {signal.step && (
                      <span className="font-gt-flexa text-xs font-normal text-ash-gray">step {signal.step}</span>
                    )}
                  </div>
                  <pre className="overflow-x-auto rounded-[20px] bg-carbon/40 p-4 font-gt-flexa text-sm font-normal text-bone-white/80">
                    {signal.excerpt}
                  </pre>
                </div>
              ))}
            </div>

            {/* Bug verdict — GT-Flexa for all labels and values */}
            <div className="mt-8 rounded-[20px] border border-ash-gray/40 p-6">
              <h3 className="mb-4 font-tobias-light text-[32px] font-normal tracking-[-0.048em] text-bone-white">
                Bug Verdict
              </h3>
              <div className="space-y-3">
                <div className="flex gap-4">
                  <span className="w-32 font-gt-flexa text-sm font-normal text-ash-gray">Title</span>
                  <span className="flex-1 font-gt-flexa text-sm font-normal text-bone-white">{bugVerdict.bug_title}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-32 font-gt-flexa text-sm font-normal text-ash-gray">Category</span>
                  <span className="font-gt-flexa text-sm font-normal text-bone-white">{bugVerdict.family} / {bugVerdict.category}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-32 font-gt-flexa text-sm font-normal text-ash-gray">Severity</span>
                  <span className="capitalize font-gt-flexa text-sm font-normal text-bone-white">{bugVerdict.severity}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-32 font-gt-flexa text-sm font-normal text-ash-gray">Confidence</span>
                  <span className="font-gt-flexa text-sm font-normal text-bone-white">{(bugVerdict.confidence * 100).toFixed(0)}%</span>
                </div>
                {bugVerdict.root_cause && (
                  <div className="flex gap-4">
                    <span className="w-32 font-gt-flexa text-sm font-normal text-ash-gray">Root cause</span>
                    <span className="flex-1 font-times text-sm text-bone-white">{bugVerdict.root_cause}</span>
                  </div>
                )}
                {bugVerdict.suggestion && (
                  <div className="flex gap-4">
                    <span className="w-32 font-gt-flexa text-sm font-normal text-ash-gray">Suggestion</span>
                    <span className="flex-1 font-times text-sm text-lavender-link">{bugVerdict.suggestion}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Agent action — white ghost button aesthetic */}
            <div className="mt-8 rounded-[20px] border border-ash-gray/40 p-6">
              <h3 className="mb-2 font-tobias-light text-[32px] font-normal tracking-[-0.048em] text-bone-white">
                Send to Agent
              </h3>
              <p className="mb-4 font-times text-sm text-ash-gray">
                A structured failure report has been generated. The agent reads it,
                patches the code, and saves — the watcher re-runs Kane automatically.
              </p>
              <div className="rounded-[20px] bg-carbon/40 p-3 font-gt-flexa text-xs font-normal text-ash-gray">
                watcher-output/failure.md ← agent reads this
              </div>
            </div>
          </div>
        )}

        {/* Passed state — left-aligned, not centered */}
        {state.status === "passed" && result && (
          <div className="rounded-[20px] border border-ash-gray/40 p-12">
            <h2 className="mb-4 font-gt-flexa text-[42px] font-extralight leading-[1.2] text-bone-white">
              All Flows Verified
            </h2>
            <p className="font-times text-base text-ash-gray">
              No console errors. No 5xx responses. No invisible breaks.
            </p>
            <p className="mt-3 font-times text-sm text-ash-gray">
              Re-runs are free — this runs on every save without burning credits.
            </p>
          </div>
        )}

        {/* Step results — GT-Flexa for all UI chrome */}
        {result && result.steps.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-6 font-tobias-light text-[42px] font-normal uppercase tracking-[-0.062em] text-bone-white">
              Step Results
            </h2>
            <div className="space-y-2">
              {result.steps.map((step) => (
                <div
                  key={step.index}
                  className="flex items-center justify-between rounded-[20px] border border-ash-gray/40 px-6 py-4"
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`h-2 w-2 rounded-full ${
                        step.status === "passed"
                          ? "bg-bone-white"
                          : step.status === "failed"
                          ? "bg-ember-orange"
                          : "bg-ash-gray"
                      }`}
                    />
                    <span className="font-gt-flexa text-sm font-normal text-bone-white">
                      Step {step.index}: {step.heading}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-gt-flexa text-sm font-normal text-ash-gray">
                    <span className="capitalize">{step.status}</span>
                    <span>{step.duration}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links — lavender inline link */}
        {result?.shareUrl && (
          <div className="mt-8">
            <a
              href={result.shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-gt-flexa text-base font-normal text-lavender-link hover:underline"
            >
              View on Kane Dashboard →
            </a>
          </div>
        )}

        {/* Demo controls — lavender outlined actions (nav-level, not purchase) */}
        <div className="mt-16 rounded-[20px] border border-ash-gray/40 p-6">
          <h3 className="mb-3 font-tobias-light text-[32px] font-normal tracking-[-0.048em] text-bone-white">
            Demo
          </h3>
          <p className="mb-6 font-times text-sm text-ash-gray">
            The checkout page looks identical in both states. The difference is invisible —
            console errors and 500 responses that only Kane CLI catches.
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/checkout?breaks=true"
              className="rounded-[20px] border border-lavender-link px-4 py-2 font-gt-flexa text-sm font-normal text-lavender-link transition hover:bg-lavender-link/10"
            >
              Broken checkout
            </a>
            <a
              href="/checkout"
              className="rounded-[20px] border border-lavender-link px-4 py-2 font-gt-flexa text-sm font-normal text-lavender-link transition hover:bg-lavender-link/10"
            >
              Fixed checkout
            </a>
          </div>
        </div>

        {/* Architecture diagram — GT-Flexa for all chrome */}
        <div className="mt-12 rounded-[20px] border border-ash-gray/40 p-6">
          <h3 className="mb-6 font-tobias-light text-[32px] font-normal tracking-[-0.048em] text-bone-white">
            How the loop works
          </h3>
          <div className="flex flex-wrap items-center gap-2 font-gt-flexa text-xs font-normal text-ash-gray">
            <span className="rounded-[20px] border border-ash-gray/30 px-3 py-1.5">Code change</span>
            <span>→</span>
            <span className="rounded-[20px] border border-ash-gray/30 px-3 py-1.5">Watcher detects</span>
            <span>→</span>
            <span className="rounded-[20px] border border-ash-gray/30 px-3 py-1.5">Kane runs flows</span>
            <span>→</span>
            <span className="rounded-[20px] border border-ash-gray/30 px-3 py-1.5">failure.md generated</span>
            <span>→</span>
            <span className="rounded-[20px] border border-ash-gray/30 px-3 py-1.5">Agent reads + fixes</span>
            <span>→</span>
            <span className="rounded-[20px] border border-ash-gray/30 px-3 py-1.5">Save triggers re-run</span>
            <span>→</span>
            <span className="rounded-[20px] border border-bone-white/30 px-3 py-1.5 text-bone-white">Green</span>
          </div>
        </div>
      </main>

      {/* Footer — 128px gap, no borders */}
      <footer className="mx-auto max-w-[1200px] px-6 pt-32 pb-16">
        <p className="font-gt-flexa text-[68px] font-extralight leading-[1.06] text-bone-white">
          QuantumStore
        </p>
        <p className="mt-4 font-times text-sm text-ash-gray">
          Built with an AI agent. Verified with Kane CLI.
        </p>
      </footer>
    </div>
  );
}
