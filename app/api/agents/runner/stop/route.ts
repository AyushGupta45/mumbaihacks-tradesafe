import { NextRequest, NextResponse } from 'next/server';
import { stopRunner, getRunnerStatus } from '@/lib/agents/runner';

/**
 * POST /api/agents/runner/stop
 * 
 * Stop the autonomous runner
 */
export async function POST(request: NextRequest) {
  try {
    const stopped = stopRunner();

    if (!stopped) {
      return NextResponse.json({
        success: false,
        status: 'not_running',
        message: 'Runner is not currently running'
      });
    }

    const finalStatus = getRunnerStatus();

    return NextResponse.json({
      success: true,
      status: 'stopped',
      statistics: {
        totalPolls: finalStatus.pollCount,
        opportunitiesProcessed: finalStatus.opportunitiesProcessed,
        executionsAttempted: finalStatus.executionsAttempted,
        executionsSuccessful: finalStatus.executionsSuccessful
      },
      message: 'Autonomous runner stopped successfully'
    });
  } catch (error) {
    console.error('Error stopping runner:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to stop runner',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
