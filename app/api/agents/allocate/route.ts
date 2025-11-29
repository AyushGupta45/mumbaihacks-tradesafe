import { NextRequest, NextResponse } from "next/server";
import { allocateCapitalForOpportunity } from "@/lib/agents/capitalAllocation";
import { Opportunity } from "@/lib/arbitrage/detector";
import { RiskAssessmentResult } from "@/lib/agents/riskAssessment";
import { Portfolio } from "@/lib/agents/capitalAllocation";
import { addAuditLog } from "@/lib/state/auditLog";

/**
 * POST /api/agents/allocate
 *
 * Get capital allocation recommendations for an opportunity
 *
 * Body:
 * {
 *   opportunity: Opportunity;
 *   risk: RiskAssessmentResult;
 *   portfolio: Portfolio;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunity, risk, portfolio } = body;

    // Validate inputs
    if (!opportunity || !risk || !portfolio) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields (opportunity, risk, portfolio)",
        },
        { status: 400 }
      );
    }

    // Validate portfolio structure
    if (
      typeof portfolio.usdtBalance !== "number" ||
      typeof portfolio.maxTradeAmount !== "number"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid portfolio structure" },
        { status: 400 }
      );
    }

    // Perform capital allocation
    const allocation = allocateCapitalForOpportunity(
      opportunity as Opportunity,
      risk as RiskAssessmentResult,
      portfolio as Portfolio
    );

    // Log to audit trail
    addAuditLog({
      eventType: "allocation",
      agentName: "Capital Manager",
      opportunityId: opportunity.id,
      action: "Allocate Capital",
      details: {
        symbol: opportunity.symbol,
        allocatedAmount: allocation.allocatedUSDT,
        allocationPct: allocation.allocationPct,
      },
      decision: {
        outcome: allocation.allocatedUSDT > 0 ? "Allocated" : "Rejected",
        reasoning: allocation.reason,
        confidence: 1.0,
      },
    });

    return NextResponse.json({
      success: true,
      allocation,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Capital allocation error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Allocation failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
