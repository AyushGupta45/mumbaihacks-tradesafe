import { NextRequest, NextResponse } from 'next/server';
import { debateWithMedianConsensus } from '@/lib/agents/debateAgent';
import { addAuditLog } from '@/lib/state/auditLog';

/**
 * POST /api/agents/debate
 * 
 * Multi-agent debate with median consensus
 * 
 * Body:
 * {
 *   opportunity: Opportunity;
 *   risk: RiskAssessmentResult;
 *  allocation: AllocationResult;
 *   executeConfidenceThreshold?: number;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunity, risk, allocation, executeConfidenceThreshold = 0.6 } = body;

    if (!opportunity || !risk || !allocation) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields (opportunity, risk, allocation)' },
        { status: 400 }
      );
    }

    // Conduct debate with median consensus
    const debateResult = await debateWithMedianConsensus(
      opportunity,
      risk,
      allocation,
      executeConfidenceThreshold
    );

    // Log to audit trail
    addAuditLog({
      eventType: 'debate',
      agentName: 'Debate Moderator',
      opportunityId: opportunity.id,
      action: 'Conduct Multi-Agent Debate',
      details: {
        symbol: opportunity.symbol,
        bullishScore: debateResult.bullish.score,
        bearishScore: debateResult.bearish.score,
        neutralScore: debateResult.neutral.score,
        finalScore: debateResult.finalDecisionScore
      },
      decision: {
        outcome: debateResult.decision === 'execute' ? 'Consensus Reached' : 'Consensus Failed',
        reasoning: `Final score ${debateResult.finalDecisionScore.toFixed(2)} vs threshold ${executeConfidenceThreshold}`,
        confidence: debateResult.finalDecisionScore
      }
    });

    return NextResponse.json({
      success: true,
      debate: debateResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debate error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Debate failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
