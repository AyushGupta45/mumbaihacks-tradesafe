import { NextRequest, NextResponse } from 'next/server';
import { startRunner } from '@/lib/agents/runner';

/**
 * POST /api/agents/runner/start
 * 
 * Start the autonomous runner
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { pollMs = 2000 } = body;

    const started = startRunner(pollMs);

    if (!started) {
      return NextResponse.json({
        success: false,
        status: 'already_running',
        message: 'Runner is already running'
      });
    }

    return NextResponse.json({
      success: true,
      status: 'running',
      pollMs,
      message: 'Autonomous runner started successfully'
    });
  } catch (error) {
    console.error('Error starting runner:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start runner',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
