import { NextRequest, NextResponse } from 'next/server';
import { assessRisk } from '@/lib/agents/riskAssessment';
import { Opportunity } from '@/lib/arbitrage/detector';
import { addAuditLog } from '@/lib/state/auditLog';

/**
 * POST /api/agents/risk
 * 
 * Get risk assessment for an arbitrage opportunity
 * 
 * Body:
 * {
 *   opportunity: Opportunity;
 *   targetQuantity?: number;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunity, targetQuantity = 1 } = body;

    // Validate inputs
    if (!opportunity || !opportunity.symbol) {
      return NextResponse.json(
        { success: false, error: 'Invalid opportunity object' },
        { status: 400 }
      );
    }

    // Perform risk assessment
    const assessment = await assessRisk(opportunity as Opportunity, targetQuantity);

    // Log to audit trail
    addAuditLog({
      eventType: 'risk_assessment',
      agentName: 'Risk Guardian',
      opportunityId: opportunity.id,
      action: 'Assess Trade Risk',
      details: {
        symbol: opportunity.symbol,
        riskScore: assessment.riskScore,
        notes: assessment.notes
      },
      decision: {
        outcome: assessment.riskScore > 70 ? 'High Risk' : assessment.riskScore > 30 ? 'Medium Risk' : 'Low Risk',
        reasoning: assessment.notes[0] || 'Risk assessment completed',
        confidence: 1 - (assessment.riskScore / 100)
      }
    });

    return NextResponse.json({
      success: true,
      assessment,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Risk assessment error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Risk assessment failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
