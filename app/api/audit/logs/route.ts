import { NextResponse } from "next/server";
import { getAuditLog, getEnhancedAuditLog } from "@/lib/state/auditLog";

/**
 * GET /api/audit/logs
 * Returns audit log entries with optional filtering
 * Query params: ?limit=20&enhanced=true
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("eventType") || undefined;
    const agentName = searchParams.get("agentName") || undefined;
    const opportunityId = searchParams.get("opportunityId") || undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 20;
    const enhanced = searchParams.get("enhanced") === "true";

    if (enhanced) {
      // Return enhanced audit logs with full agent outputs
      const enhancedLogs = getEnhancedAuditLog(limit);
      return NextResponse.json({
        logs: enhancedLogs,
        count: enhancedLogs.length,
        type: 'enhanced',
        timestamp: Date.now(),
      });
    }

    // Return standard audit logs  
    const logs = getAuditLog({
      eventType,
      agentName,
      opportunityId,
      limit,
    });

    return NextResponse.json({
      logs,
      count: logs.length,
      type: 'standard',
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch audit logs", details: error },
      { status: 500 }
    );
  }
}
