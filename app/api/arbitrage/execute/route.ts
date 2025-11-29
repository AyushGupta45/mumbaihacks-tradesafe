import { NextRequest, NextResponse } from 'next/server';
import { executeArbitrageWithPartialFills } from '@/lib/agents/executionEngine';

/**
 * POST /api/arbitrage/execute
 * 
 * Execute arbitrage opportunity with partial fill handling
 * 
 * Body:
 * {
 *   opportunity: Opportunity;
 *   allocatedUSDT: number;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { opportunity, allocatedUSDT } = body;

    if (!opportunity || !allocatedUSDT) {
      return NextResponse.json(
        { success: false, error: 'opportunity and allocatedUSDT are required' },
        { status: 400 }
      );
    }

    // Execute arbitrage with partial fill handling
    const result = await executeArbitrageWithPartialFills(opportunity, allocatedUSDT);

    return NextResponse.json({
      ...result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Execution error:', error);
    return NextResponse.json(
      {  
        success: false,
        error: 'Execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
