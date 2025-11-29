import { NextResponse } from "next/server";
import { getPortfolio } from "@/lib/state/portfolio";
import { getSettings } from "@/lib/state/settings";
import { getRunnerStatus, getGuardianConfig } from "@/lib/agents/runner";
import { getExecutionLog } from "@/lib/state/executionLog";

/**
 * GET /api/state
 * Returns current system state (portfolio, settings, runner status, recent executions, guardian)
 */
export async function GET() {
  try {
    const portfolio = getPortfolio();
    const settings = getSettings();
    const runnerStatus = getRunnerStatus();
    const guardianSettings = getGuardianConfig();
    const executionLogRecent = getExecutionLog().slice(-10); // Last 10 executions

    return NextResponse.json({
      portfolio,
      settings,
      runnerStatus,
      guardianSettings,
      executionLogRecent,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch state", details: error },
      { status: 500 }
    );
  }
}
