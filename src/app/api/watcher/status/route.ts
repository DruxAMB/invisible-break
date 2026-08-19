import { NextResponse } from "next/server";
import { getState } from "@/lib/watcher/state-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(): Promise<NextResponse> {
  const state = getState();
  return NextResponse.json(state);
}
