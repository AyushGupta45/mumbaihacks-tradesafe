import { NextRequest, NextResponse } from 'next/server';
import { updateGuardianConfig, getGuardianConfig } from '@/lib/agents/runner';

/**
 * POST /api/settings/guardian
 * Update Guardian configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    updateGuardianConfig(body);
    
    return NextResponse.json({
      success: true,
      config: getGuardianConfig()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update guardian config' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    config: getGuardianConfig()
  });
}
