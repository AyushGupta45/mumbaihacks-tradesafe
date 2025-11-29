import { NextRequest, NextResponse } from 'next/server';
import { discoverPrices } from '@/lib/agents/priceDiscovery';

/**
 * GET /api/prices
 * 
 * Fetch real-time prices from all exchanges using the Price Discovery Agent
 * 
 * Query params:
 * - symbols: comma-separated list of symbols (e.g., "BTCUSDT,ETHUSDT")
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
      return NextResponse.json(
        { success: false, error: 'symbols parameter is required' },
        { status: 400 }
      );
    }

    const symbols = symbolsParam.split(',').map(s => s.trim());
    
    // Use Price Discovery Agent to fetch prices from all exchanges
    const prices = await discoverPrices(symbols);

    return NextResponse.json({
      success: true,
      data: prices,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Prices API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch prices',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
