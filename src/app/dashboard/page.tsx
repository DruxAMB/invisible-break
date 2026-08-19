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
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold tracking-tight">
              Quantum<span className="text-emerald-400">Store</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-sm text-zinc-400">Invisible Break</span>
          </div>
          <Link
            href="/"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm transition hover:border-zinc-500"
          >
            ← Store
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Verification Dashboard
          </h1>
          <p className="text-zinc-400">
            Kane CLI runs flows with DevTools assertions — catching what screenshots miss.
          </p>
        </div>

        {/* Status bar */}
        <div className="mb-8 flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <div className="flex items-center gap-4">
            <div
              className={`h-4 w-4 rounded-full ${
                isRunning
                  ? "animate-pulse bg-amber-500"
                  : state.status === "passed"
                  ? "bg-emerald-500"
                  : state.status === "failed"
                  ? "bg-red-500"
                  : "bg-zinc-600"
              }`}
            />
            <div>
              <div className="font-medium">
                {isRunning
                  ? "Running verification..."
                  : state.status === "passed"
                  ? "All checks passed"
                  : state.status === "failed"
                  ? `${bugVerdict?.signals.length ?? 0} invisible break${(bugVerdict?.signals.length ?? 0) > 1 ? "s" : ""} found`
                  : "Idle — click Run to verify"}
              </div>
              {result && (
                <div className="text-sm text-zinc-400">
                  Last run: {result.duration}s · {result.creditsConsumed.toFixed(2)} credits · {new Date(result.timestamp).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={triggerRun}
            disabled={isRunning || polling}
            className="rounded-lg bg-emerald-500 px-6 py-3 text-sm font-semibold text-black transition hover:bg-emerald-400 disabled:opacity-50"
          >
            {isRunning ? "Running..." : "Run Verification"}
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-800 bg-red-950/30 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Failure cards */}
        {hasFailures && bugVerdict && (
          <div className="mb-8">
            <h2 className="mb-4 text-lg font-semibold text-red-400">
              ❌ Invisible Breaks Detected
            </h2>
            <div className="space-y-4">
              {bugVerdict.signals.map((signal, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-red-900/50 bg-red-950/20 p-6"
                >
                  <div className="mb-2 flex items-center gap-3">
                    <span className="rounded-md bg-red-900/50 px-2 py-1 text-xs font-mono text-red-300">
                      {signal.type}
                    </span>
                    {signal.step && (
                      <span className="text-xs text-zinc-500">step {signal.step}</span>
                    )}
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-black/50 p-4 text-sm text-red-200">
                    {signal.excerpt}
                  </pre>
                </div>
              ))}
            </div>

            {/* Bug verdict details */}
            <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
              <h3 className="mb-3 font-semibold text-zinc-200">Bug Verdict</h3>
              <div className="space-y-2 text-sm">
                <div className="flex gap-4">
                  <span className="w-32 text-zinc-400">Title</span>
                  <span>{bugVerdict.bug_title}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-32 text-zinc-400">Category</span>
                  <span>{bugVerdict.family} / {bugVerdict.category}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-32 text-zinc-400">Severity</span>
                  <span className="capitalize">{bugVerdict.severity}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-32 text-zinc-400">Confidence</span>
                  <span>{(bugVerdict.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-32 text-zinc-400">Root cause</span>
                  <span className="flex-1">{bugVerdict.root_cause}</span>
                </div>
                <div className="flex gap-4">
                  <span className="w-32 text-zinc-400">Suggestion</span>
                  <span className="flex-1 text-emerald-400">{bugVerdict.suggestion}</span>
                </div>
              </div>
            </div>

            {/* Agent action */}
            <div className="mt-6 rounded-xl border border-emerald-800 bg-emerald-950/20 p-6">
              <h3 className="mb-2 font-semibold text-emerald-400">
                → Send to Agent
              </h3>
              <p className="mb-3 text-sm text-zinc-300">
                A structured failure report has been generated. The agent reads it,
                patches the code, and saves — the watcher re-runs Kane automatically.
              </p>
              <div className="rounded-lg bg-black/50 p-3 font-mono text-xs text-zinc-400">
                watcher-output/failure.md ← agent reads this
              </div>
            </div>
          </div>
        )}

        {/* Passed state */}
        {state.status === "passed" && result && (
          <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 p-8 text-center">
            <div className="mb-4 text-5xl">✅</div>
            <h2 className="mb-2 text-xl font-bold text-emerald-400">
              All Flows Verified
            </h2>
            <p className="text-zinc-400">
              No console errors. No 5xx responses. No invisible breaks.
            </p>
            <p className="mt-2 text-sm text-zinc-500">
              Re-runs are free — this runs on every save without burning credits.
            </p>
          </div>
        )}

        {/* Step results */}
        {result && result.steps.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold">Step Results</h2>
            <div className="space-y-2">
              {result.steps.map((step) => (
                <div
                  key={step.index}
                  className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {step.status === "passed" ? "✅" : step.status === "failed" ? "❌" : "⏭️"}
                    </span>
                    <span className="text-sm">Step {step.index}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-zinc-400">
                    <span className="capitalize">{step.status}</span>
                    <span>{step.duration}s</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Links */}
        {result?.shareUrl && (
          <div className="mt-8 text-center">
            <a
              href={result.shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-emerald-400 underline hover:text-emerald-300"
            >
              View on Kane Dashboard →
            </a>
          </div>
        )}

        {/* Architecture diagram */}
        <div className="mt-12 rounded-xl border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="mb-4 text-sm font-semibold text-zinc-300">How the loop works</h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
            <span className="rounded-md bg-zinc-800 px-3 py-1.5">📝 Code change</span>
            <span>→</span>
            <span className="rounded-md bg-zinc-800 px-3 py-1.5">👁️ Watcher detects</span>
            <span>→</span>
            <span className="rounded-md bg-zinc-800 px-3 py-1.5">🧪 Kane runs flows</span>
            <span>→</span>
            <span className="rounded-md bg-zinc-800 px-3 py-1.5">📋 failure.md generated</span>
            <span>→</span>
            <span className="rounded-md bg-zinc-800 px-3 py-1.5">🤖 Agent reads + fixes</span>
            <span>→</span>
            <span className="rounded-md bg-zinc-800 px-3 py-1.5">💾 Save triggers re-run</span>
            <span>→</span>
            <span className="rounded-md bg-emerald-900/50 px-3 py-1.5 text-emerald-400">✅ Green</span>
          </div>
        </div>
      </main>
    </div>
  );
}
