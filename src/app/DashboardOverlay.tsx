"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import gsap from "gsap";

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

export function DashboardOverlay({
  open,
  onClose,
  onTryBreaks,
}: {
  open: boolean;
  onClose: () => void;
  onTryBreaks: () => void;
}) {
  const [state, setState] = useState<WatcherState>({
    status: "idle",
    lastResult: null,
  });
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // GSAP refs
  const overlayRef = useRef<HTMLDivElement>(null);
  const crtRef = useRef<HTMLDivElement>(null);
  const scanlineRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const statusDotRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

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
    if (!open) return;
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [open, fetchStatus]);

  // CRT power-on boot animation
  useEffect(() => {
    if (!open) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline();

      // 1. CRT power-on — overlay starts as a thin line, snaps open
      if (overlayRef.current) {
        gsap.set(overlayRef.current, {
          scaleY: 0.005,
          scaleX: 1,
          transformOrigin: "center center",
          opacity: 1,
        });
        tl.to(overlayRef.current, {
          scaleY: 1,
          duration: 0.35,
          ease: "power4.out",
        });
      }

      // 2. CRT flash — brief brightness overlay
      if (crtRef.current) {
        gsap.set(crtRef.current, { opacity: 0.8 });
        tl.to(crtRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: "power2.out",
        }, 0.3);
      }

      // 3. Scanline sweep — horizontal line top to bottom
      if (scanlineRef.current) {
        gsap.set(scanlineRef.current, {
          top: "0%",
          opacity: 1,
        });
        tl.to(scanlineRef.current, {
          top: "100%",
          duration: 0.6,
          ease: "power1.inOut",
        }, 0.35);
      }

      // 4. Header glitch-in
      if (headerRef.current) {
        gsap.set(headerRef.current, { opacity: 0, x: -10 });
        tl.to(headerRef.current, {
          opacity: 1,
          x: 0,
          duration: 0.2,
          ease: "steps(3)",
        }, 0.5);
      }

      // 5. Content sections stagger up with glitch
      if (contentRef.current) {
        const sections = contentRef.current.querySelectorAll("[data-boot]");
        gsap.set(sections, { opacity: 0, y: 20, x: 0 });
        tl.to(sections, {
          opacity: 1,
          y: 0,
          x: 0,
          duration: 0.35,
          stagger: 0.06,
          ease: "power2.out",
          clearProps: "opacity,transform",
        }, 0.55);
      }

      // 6. Status dot slam-in with bounce
      if (statusDotRef.current) {
        gsap.set(statusDotRef.current, { scale: 0, transformOrigin: "center" });
        tl.to(statusDotRef.current, {
          scale: 1,
          duration: 0.4,
          ease: "back.out(3)",
        }, 0.8);
      }
    });

    return () => ctx.revert();
  }, [open]);

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

  if (!open) return null;

  const isRunning = state.status === "running";
  const result = state.lastResult;
  const hasFailures = result?.overallStatus === "failed";
  const bugVerdict = result?.bugVerdict;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[60] bg-ink-black/50"
        onClick={onClose}
      />

      {/* Full-screen overlay panel */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-[70] flex flex-col bg-arcade-cream font-arcade"
      >
        {/* CRT flash overlay — brief white flash on boot */}
        <div
          ref={crtRef}
          className="pointer-events-none fixed inset-0 z-[80] bg-white"
        />

        {/* Scanline — sweeps top to bottom on boot */}
        <div
          ref={scanlineRef}
          className="pointer-events-none fixed left-0 right-0 z-[79] h-[2px] bg-ink-black/60"
        />

        {/* Header with close button */}
        <header ref={headerRef} className="border-b border-ink-black bg-arcade-cream px-6 py-3">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-bold leading-[1.56] text-ink-black">
                ✚ QuantumStore
              </span>
              <span className="text-[14px] font-normal leading-[1.43] text-ink-black">/</span>
              <span className="text-[14px] font-bold leading-[1.43] text-ink-black">
                INVISIBLE BREAK
              </span>
            </div>
            <button
              onClick={onClose}
              className="rounded-[6px] border border-ink-black px-3 py-1 text-[14px] font-bold leading-[1.43] text-ink-black transition hover:bg-ink-black hover:text-arcade-cream"
            >
              ← BACK TO STORE
            </button>
          </div>
        </header>

        {/* Scrollable content */}
        <main ref={contentRef} className="mx-auto w-full max-w-[1200px] flex-1 overflow-y-auto px-6 py-[44px]">
          {/* Title */}
          <div data-boot>
          <h1 className="mb-2 text-[18px] font-bold leading-[1.56] text-ink-black">
            VERIFICATION
          </h1>
          <p className="mb-[44px] max-w-lg text-[16px] font-normal leading-[1.5] text-ink-black">
            Kane CLI runs flows with DevTools assertions — catching what screenshots miss.
          </p>
          </div>

          {/* Status bar */}
          <div data-boot className="mb-[44px] flex items-center justify-between rounded-[12px] border border-pixel-gray bg-arcade-cream p-3">
            <div className="flex items-center gap-3">
              <div
                ref={statusDotRef}
                className={`h-3 w-3 ${
                  isRunning
                    ? "animate-pulse bg-marquee-orange"
                    : state.status === "passed"
                    ? "bg-buy-green"
                    : state.status === "failed"
                    ? "bg-ink-black"
                    : "bg-muted-gray"
                }`}
              />
              <div>
                <div className="text-[16px] font-bold leading-[1.5] text-ink-black">
                  {isRunning
                    ? "RUNNING VERIFICATION..."
                    : state.status === "passed"
                    ? "ALL CHECKS PASSED"
                    : state.status === "failed"
                    ? `${bugVerdict?.signals.length ?? 0} INVISIBLE BREAK${(bugVerdict?.signals.length ?? 0) > 1 ? "S" : ""} FOUND`
                    : "IDLE — CLICK RUN TO VERIFY"}
                </div>
                {result && (
                  <div className="text-[14px] font-normal leading-[1.43] text-ink-black">
                    Last run: {result.duration}s · {result.creditsConsumed.toFixed(2)} credits · {new Date(result.timestamp).toLocaleTimeString()}
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={triggerRun}
              disabled={isRunning || polling}
              className="rounded-[6px] bg-buy-green px-4 py-2 text-[14px] font-bold uppercase leading-[1.43] text-white shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-buy-green/90 disabled:opacity-40"
            >
              {isRunning ? "RUNNING..." : "RUN VERIFICATION"}
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-[12px] border border-ink-black bg-arcade-cream p-3">
              <p className="text-[14px] font-normal leading-[1.43] text-ink-black">{error}</p>
            </div>
          )}

          {/* Failure cards */}
          {hasFailures && bugVerdict && (
            <div data-boot className="mb-[44px]">
              <h2 className="mb-4 text-[18px] font-bold leading-[1.56] text-ink-black">
                INVISIBLE BREAKS DETECTED
              </h2>
              <div className="space-y-2">
                {bugVerdict.signals.map((signal, i) => (
                  <div
                    key={i}
                    className="rounded-[12px] border border-pixel-gray bg-arcade-cream p-3"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-[9999px] border border-ink-black px-2 py-0.5 text-[10px] font-normal leading-[1.5] text-ink-black">
                        {signal.type}
                      </span>
                      {signal.step && (
                        <span className="text-[10px] font-normal leading-[1.5] text-ink-black">
                          STEP {signal.step}
                        </span>
                      )}
                    </div>
                    <pre className="overflow-x-auto rounded-[12px] border border-pixel-gray bg-arcade-cream p-3 text-[14px] font-normal leading-[1.43] text-ink-black">
                      {signal.excerpt}
                    </pre>
                  </div>
                ))}
              </div>

              {/* Bug verdict */}
              <div className="mt-4 rounded-[12px] border border-pixel-gray bg-arcade-cream p-3">
                <h3 className="mb-3 text-[18px] font-bold leading-[1.56] text-ink-black">
                  BUG VERDICT
                </h3>
                <div className="space-y-2">
                  <div className="flex gap-4">
                    <span className="w-32 text-[14px] font-normal leading-[1.43] text-ink-black">TITLE</span>
                    <span className="flex-1 text-[14px] font-bold leading-[1.43] text-ink-black">{bugVerdict.bug_title}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-32 text-[14px] font-normal leading-[1.43] text-ink-black">CATEGORY</span>
                    <span className="text-[14px] font-normal leading-[1.43] text-ink-black">{bugVerdict.family} / {bugVerdict.category}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-32 text-[14px] font-normal leading-[1.43] text-ink-black">SEVERITY</span>
                    <span className="capitalize text-[14px] font-normal leading-[1.43] text-ink-black">{bugVerdict.severity}</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="w-32 text-[14px] font-normal leading-[1.43] text-ink-black">CONFIDENCE</span>
                    <span className="text-[14px] font-bold leading-[1.43] text-ink-black">{(bugVerdict.confidence * 100).toFixed(0)}%</span>
                  </div>
                  {bugVerdict.root_cause && (
                    <div className="flex gap-4">
                      <span className="w-32 text-[14px] font-normal leading-[1.43] text-ink-black">ROOT CAUSE</span>
                      <span className="flex-1 text-[14px] font-normal leading-[1.43] text-ink-black">{bugVerdict.root_cause}</span>
                    </div>
                  )}
                  {bugVerdict.suggestion && (
                    <div className="flex gap-4">
                      <span className="w-32 text-[14px] font-normal leading-[1.43] text-ink-black">SUGGESTION</span>
                      <span className="flex-1 text-[14px] font-bold leading-[1.43] text-ink-black">{bugVerdict.suggestion}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Agent action */}
              <div className="mt-4 rounded-[12px] border border-pixel-gray bg-arcade-cream p-3">
                <h3 className="mb-2 text-[18px] font-bold leading-[1.56] text-ink-black">
                  SEND TO AGENT
                </h3>
                <p className="mb-3 text-[14px] font-normal leading-[1.43] text-ink-black">
                  A structured failure report has been generated. The agent reads it,
                  patches the code, and saves — the watcher re-runs Kane automatically.
                </p>
                <div className="rounded-[6px] border border-pixel-gray bg-arcade-cream p-2 text-[14px] font-normal leading-[1.43] text-ink-black">
                  watcher-output/failure.md ← agent reads this
                </div>
              </div>
            </div>
          )}

          {/* Passed state */}
          {state.status === "passed" && result && (
            <div data-boot className="rounded-[12px] border border-pixel-gray bg-arcade-cream p-6">
              <h2 className="mb-3 text-[18px] font-bold leading-[1.56] text-ink-black">
                ALL FLOWS VERIFIED
              </h2>
              <p className="text-[16px] font-normal leading-[1.5] text-ink-black">
                No console errors. No 5xx responses. No invisible breaks.
              </p>
              <p className="mt-2 text-[14px] font-normal leading-[1.43] text-ink-black">
                Re-runs are free — this runs on every save without burning credits.
              </p>
            </div>
          )}

          {/* Step results */}
          {result && result.steps.length > 0 && (
            <div data-boot className="mt-[44px]">
              <h2 className="mb-4 text-[18px] font-bold leading-[1.56] text-ink-black">
                STEP RESULTS
              </h2>
              <div className="space-y-1">
                {result.steps.map((step) => (
                  <div
                    key={step.index}
                    className="flex items-center justify-between rounded-[12px] border border-pixel-gray bg-arcade-cream p-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-2 w-2 ${
                          step.status === "passed"
                            ? "bg-buy-green"
                            : step.status === "failed"
                            ? "bg-ink-black"
                            : "bg-muted-gray"
                        }`}
                      />
                      <span className="text-[14px] font-bold leading-[1.43] text-ink-black">
                        STEP {step.index}: {step.heading.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[14px] font-normal leading-[1.43] text-ink-black">
                      <span className="uppercase">{step.status}</span>
                      <span>{step.duration}s</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Links */}
          {result?.shareUrl && (
            <div className="mt-4">
              <a
                href={result.shareUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[14px] font-bold leading-[1.43] text-ink-black underline"
              >
                VIEW ON KANE DASHBOARD →
              </a>
            </div>
          )}

          {/* Demo controls */}
          <div data-boot className="mt-[44px] rounded-[12px] border border-pixel-gray bg-arcade-cream p-3">
            <h3 className="mb-2 text-[18px] font-bold leading-[1.56] text-ink-black">
              DEMO
            </h3>
            <p className="mb-3 text-[14px] font-normal leading-[1.43] text-ink-black">
              The store looks identical in both states. The difference is invisible —
              console errors and 500 responses that only Kane CLI catches.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  onTryBreaks();
                  onClose();
                }}
                className="rounded-[6px] border border-ink-black bg-transparent px-3 py-1 text-[14px] font-normal leading-[1.43] text-ink-black shadow-[inset_0_1px_0_0_#f3e5df] transition hover:bg-ink-black hover:text-arcade-cream"
              >
                ⚠ TRY INVISIBLE BREAKS
              </button>
            </div>
          </div>

          {/* Architecture diagram */}
          <div data-boot className="mt-[44px] rounded-[12px] border border-pixel-gray bg-arcade-cream p-3">
            <h3 className="mb-4 text-[18px] font-bold leading-[1.56] text-ink-black">
              HOW THE LOOP WORKS
            </h3>
            <div className="flex flex-wrap items-center gap-1 text-[10px] font-normal leading-[1.5] text-ink-black">
              <span className="rounded-[6px] border border-pixel-gray px-2 py-1">CODE CHANGE</span>
              <span>→</span>
              <span className="rounded-[6px] border border-pixel-gray px-2 py-1">WATCHER DETECTS</span>
              <span>→</span>
              <span className="rounded-[6px] border border-pixel-gray px-2 py-1">KANE RUNS FLOWS</span>
              <span>→</span>
              <span className="rounded-[6px] border border-pixel-gray px-2 py-1">FAILURE.MD GENERATED</span>
              <span>→</span>
              <span className="rounded-[6px] border border-pixel-gray px-2 py-1">AGENT READS + FIXES</span>
              <span>→</span>
              <span className="rounded-[6px] border border-pixel-gray px-2 py-1">SAVE TRIGGERS RE-RUN</span>
              <span>→</span>
              <span className="rounded-[6px] border border-ink-black bg-arcade-cream px-2 py-1 font-bold">GREEN</span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-pixel-gray bg-arcade-cream px-6 py-4">
          <div className="mx-auto flex max-w-[1200px] items-center justify-between">
            <p className="text-[14px] font-normal leading-[1.43] text-ink-black">
              © QUANTUMSTORE 2026
            </p>
            <div className="flex gap-6">
              <span className="text-[14px] font-bold leading-[1.43] text-ink-black">
                BUILT by <a href="https://druxamb.dev" className="text-buy-green hover:underline">DruxAMB</a>
              </span>
              <span className="text-[14px] font-bold leading-[1.43] text-ink-black">
                VERIFIED WITH KANE
              </span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
