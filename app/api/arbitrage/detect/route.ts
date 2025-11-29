import { NextRequest, NextResponse } from 'next/server';
import { discoverPrices } from '@/lib/agents/priceDiscovery';
import { detectArbitrage } from '@/lib/arbitrage/detector';

/**
 * GET /api/arbitrage/detect
 * 
 * Detect arbitrage opportunities with persistence buffer
 * 
 * Query params:
 * - symbols: comma-separated list of symbols (default: BTCUSDT,ETHUSDT)
 * - minSpreadPct: minimum spread percentage (default: 0.5)
 * - persistenceMs: time persistence required in ms (default: 2000)
 * - minPersistenceCount: minimum consecutive polls required (default: 2)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const symbolsParam = searchParams.get('symbols');
    const minSpreadPct = parseFloat(searchParams.get('minSpreadPct') || '0.5');
    const persistenceMs = parseInt(searchParams.get('persistenceMs') || '2000');
    const minPersistenceCount = parseInt(searchParams.get('minPersistenceCount') || '2');

    const symbols = symbolsParam 
      ? symbolsParam.split(',').map(s => s.trim())
      : ['BTCUSDT', 'ETHUSDT'];

    // Discover prices from all exchanges
    const prices = await discoverPrices(symbols);

    // Detect arbitrage opportunities with persistence buffer
    const opportunities = await detectArbitrage(prices, {
      minSpreadPct,
      persistenceMs,
      minPersistenceCount
    });

    return NextResponse.json({
      success: true,
      opportunities,
      scannedSymbols: symbols.length,
      foundOpportunities: opportunities.length,
      filters: {
        minSpreadPct,
        persistenceMs,
        minPersistenceCount
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Arbitrage detection error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to detect opportunities',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
