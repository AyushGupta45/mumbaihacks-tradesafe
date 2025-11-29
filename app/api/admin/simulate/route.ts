import { NextRequest, NextResponse } from "next/server";
import { updateSettings, getSettings } from "@/lib/state/settings";
import { setRunnerSymbols } from "@/lib/agents/runner";

// Global simulation state
let simulationState = {
  indianDriftOverride: null as number | null,
  exchangeOutages: [] as string[],
  pollIntervalOverride: null as number | null,
};

/**
 * GET /api/admin/simulate
 *
 * Admin controls for runtime simulation adjustments
 *
 * Query params:
 * - drift: Set Indian exchange drift (e.g., 0.02 for 2%)
 * - outage: Simulate exchange outage (e.g., 'india', 'binance', 'nse')
 * - clearOutage: Clear outage simulation (e.g., 'india')
 * - pollMs: Override poll interval in milliseconds
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const drift = searchParams.get("drift");
    const outage = searchParams.get("outage");
    const clearOutage = searchParams.get("clearOutage");
    const pollMs = searchParams.get("pollMs");

    const changes: string[] = [];

    // Handle drift override
    if (drift !== null) {
      const driftValue = parseFloat(drift);
      if (!isNaN(driftValue)) {
        simulationState.indianDriftOverride = driftValue;
        changes.push(`Indian drift set to ${(driftValue * 100).toFixed(2)}%`);

        // Update settings for Indian exchange
        updateSettings({
          indianExchange: {
            ...getSettings().indianExchange,
            priceDriftPercent: driftValue,
          },
        });
      }
    }

    // Handle exchange outage
    if (outage) {
      const exchange = outage.toLowerCase();
      if (!simulationState.exchangeOutages.includes(exchange)) {
        simulationState.exchangeOutages.push(exchange);
        changes.push(`${exchange} outage simulated`);
      }
    }

    // Handle clear outage
    if (clearOutage) {
      const exchange = clearOutage.toLowerCase();
      const index = simulationState.exchangeOutages.indexOf(exchange);
      if (index > -1) {
        simulationState.exchangeOutages.splice(index, 1);
        changes.push(`${exchange} outage cleared`);
      }
    }

    // Handle poll interval
    if (pollMs !== null) {
      const pollValue = parseInt(pollMs);
      if (!isNaN(pollValue) && pollValue >= 500) {
        simulationState.pollIntervalOverride = pollValue;
        changes.push(`Poll interval set to ${pollValue}ms`);
      }
    }

    return NextResponse.json({
      success: true,
      changes,
      currentState: simulationState,
      message:
        changes.length > 0 ? "Simulation state updated" : "No changes made",
    });
  } catch (error) {
    console.error("Admin simulate error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update simulation state",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/simulate
 *
 * Reset all simulation overrides
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (body.reset === true) {
      simulationState = {
        indianDriftOverride: null,
        exchangeOutages: [],
        pollIntervalOverride: null,
      };

      return NextResponse.json({
        success: true,
        message: "All simulation overrides reset",
        currentState: simulationState,
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: "Invalid request. Use {reset: true} to reset",
      },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to reset simulation state",
      },
      { status: 500 }
    );
  }
}
