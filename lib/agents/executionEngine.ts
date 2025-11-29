// Execution Engine Agent

import { executeBinanceTrade } from '@/lib/exchanges/binance';
import { executeIndianTrade, getIndianOrderBook } from '@/lib/exchanges/indianMock';
import { executeNSETrade } from '@/lib/exchanges/nseMock';
import { addExecutionRecord, updateExecutionRecord } from '@/lib/state/executionLog';
import { updatePortfolio, getPortfolio } from '@/lib/state/portfolio';
import { addAuditLog } from '@/lib/state/auditLog';


export interface TradeOrder {
  orderId: string;
  symbol: string;
  exchange: string;
  side: 'buy' | 'sell';
  quantity: number;
  type: 'market' | 'limit';
  price?: number;
  status: 'pending' | 'executing' | 'completed' | 'failed' | 'cancelled';
  timestamp: Date;
  mode?: 'testnet' | 'simulation' | 'live'; // Execution mode
}

export interface ExecutionResult {
  orderId: string;
  success: boolean;
  executedPrice: number;
  executedQuantity: number;
  fees: number;
  slippage: number;
  latency: number; // in ms
  error?: string;
  timestamp: Date;
  mode: 'testnet' | 'simulation' | 'live';
}

export interface ArbitrageExecution {
  executionId: string;
  buyOrder: TradeOrder;
  sellOrder: TradeOrder;
  expectedProfit: number;
  actualProfit?: number;
  status: 'planning' | 'executing' | 'completed' | 'failed';
  buyResult?: ExecutionResult;
  sellResult?: ExecutionResult;
  startTime: Date;
  endTime?: Date;
}

// In-memory execution log (in production, use database)
const executionLog: Map<string, ArbitrageExecution> = new Map();

/**
 * Execute a single trade order
 * Supports: testnet (real simulation), simulation (mock), live (real)
 */
export async function executeOrder(order: TradeOrder): Promise<ExecutionResult> {
  const startTime = Date.now();
  const mode = order.mode || 'simulation';
  
  try {
    // For safety, default to simulation mode
    if (mode === 'live') {
      throw new Error('Live trading not enabled. Use testnet or simulation mode.');
    }
    
    let result: any;
    
    // Execute based on exchange
    if (order.exchange.toLowerCase() === 'binance') {
      if (mode === 'testnet') {
        // Testnet execution - calls actual exchange mock with realistic simulation
        result = await executeBinanceTestnet(order);
      } else {
        // Full simulation
        result = await simulateTrade(order);
      }
    } else if (order.exchange.toLowerCase() === 'wazirx' || order.exchange.toLowerCase() === 'indian') {
      // Indian exchanges - always simulated
      result = await executeIndianTrade(
        order.symbol,
        order.side,
        order.quantity,
        order.type,
        order.price
      );
    } else if (order.exchange.toLowerCase() === 'nse') {
      // NSE - simulated with market hours check
      result = await executeNSETrade(
        order.symbol,
        order.side,
        order.quantity,
        order.type,
        order.price
      );
    } else {
      // Unknown exchange - full simulation
      result = await simulateTrade(order);
    }
    
    const latency = Date.now() - startTime;
    
    return {
      orderId: order.orderId,
      success: true,
      executedPrice: result.executedPrice || result.price || 0,
      executedQuantity: result.executedQuantity || order.quantity,
      fees: result.fees || 0,
      slippage: result.slippagePercent || 0.1,
      latency,
      timestamp: new Date(),
      mode
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    
    return {
      orderId: order.orderId,
      success: false,
      executedPrice: 0,
      executedQuantity: 0,
      fees: 0,
      slippage: 0,
      latency,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
      mode
    };
  }
}

/**
 * Testnet Binance execution
 * Simulates real Binance behavior on testnet
 */
async function executeBinanceTestnet(order: TradeOrder): Promise<any> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  
  // Simulate realistic Binance execution
  const basePrice = order.price || 50000; // Mock price
  
  // Simulate slippage (0.01% to 0.1%)
  const slippage = 0.0001 + Math.random() * 0.0009;
  const slippageDirection = order.side === 'buy' ? 1 : -1;
  const executedPrice = basePrice * (1 + slippage * slippageDirection);
  
  // Binance fees: 0.1%
  const fees = executedPrice * order.quantity * 0.001;
  
  return {
    orderId: `BINANCE_TESTNET_${Date.now()}`,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    quantity: order.quantity,
    executedPrice,
    executedQuantity: order.quantity,
    fees,
    slippagePercent: slippage * 100,
    status: 'filled',
    timestamp: new Date(),
    exchange: 'binance_testnet',
    testnet: true
  };
}

/**
 * Full simulation for any exchange
 */
async function simulateTrade(order: TradeOrder): Promise<any> {
  // Simulate execution delay
  await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
  
  const basePrice = order.price || 50000;
  
  // Simulate slippage
  const slippage = 0.0005 + Math.random() * 0.001;
  const executedPrice = order.side === 'buy' 
    ? basePrice * (1 + slippage)
    : basePrice * (1 - slippage);
  
  // Simulate fees (0.1%)
  const fees = executedPrice * order.quantity * 0.001;
  
  return {
    orderId: `SIM_${order.exchange.toUpperCase()}_${Date.now()}`,
    symbol: order.symbol,
    side: order.side,
    type: order.type,
    quantity: order.quantity,
    executedPrice,
    executedQuantity: order.quantity,
    fees,
    slippagePercent: slippage * 100,
    status: 'filled',
    timestamp: new Date(),
    exchange: order.exchange,
    simulated: true
  };
}

/**
 * Execute complete arbitrage cycle
 * 1. Execute testnet BUY on cheaper exchange
 * 2. Wait for confirmation
 * 3. Execute SIMULATED SELL on expensive exchange
 * 4. Calculate actual profit
 */
export async function executeArbitrage(
  arbitrage: ArbitrageExecution
): Promise<ExecutionResult[]> {
  try {
    // Update status
    arbitrage.status = 'executing';
    arbitrage.startTime = new Date();
    
    // Store in execution log
    executionLog.set(arbitrage.executionId, arbitrage);
    
    const results: ExecutionResult[] = [];
    
    // Step 1: Execute BUY order (testnet mode for safety)
    console.log(`[Arbitrage ${arbitrage.executionId}] Executing BUY on ${arbitrage.buyOrder.exchange}`);
    
    arbitrage.buyOrder.mode = 'testnet'; // Force testnet for buy
    arbitrage.buyOrder.status = 'executing';
    
    const buyResult = await executeOrder(arbitrage.buyOrder);
    arbitrage.buyResult = buyResult;
    results.push(buyResult);
    
    if (!buyResult.success) {
      arbitrage.status = 'failed';
      arbitrage.buyOrder.status = 'failed';
      arbitrage.endTime = new Date();
      
      console.error(`[Arbitrage ${arbitrage.executionId}] BUY failed: ${buyResult.error}`);
      return results;
    }
    
    arbitrage.buyOrder.status = 'completed';
    console.log(`[Arbitrage ${arbitrage.executionId}] BUY completed at $${buyResult.executedPrice}`);
    
    // Step 2: Wait for confirmation (simulate)
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Step 3: Execute SELL order (simulation mode)
    console.log(`[Arbitrage ${arbitrage.executionId}] Executing SELL on ${arbitrage.sellOrder.exchange}`);
    
    arbitrage.sellOrder.mode = 'simulation'; // Simulated sell
    arbitrage.sellOrder.status = 'executing';
    
    const sellResult = await executeOrder(arbitrage.sellOrder);
    arbitrage.sellResult = sellResult;
    results.push(sellResult);
    
    if (!sellResult.success) {
      arbitrage.status = 'failed';
      arbitrage.sellOrder.status = 'failed';
      arbitrage.endTime = new Date();
      
      console.error(`[Arbitrage ${arbitrage.executionId}] SELL failed: ${sellResult.error}`);
      return results;
    }
    
    arbitrage.sellOrder.status = 'completed';
    console.log(`[Arbitrage ${arbitrage.executionId}] SELL completed at $${sellResult.executedPrice}`);
    
    // Step 4: Calculate actual profit
    const buyTotal = buyResult.executedPrice * buyResult.executedQuantity + buyResult.fees;
    const sellTotal = sellResult.executedPrice * sellResult.executedQuantity - sellResult.fees;
    const actualProfit = sellTotal - buyTotal;
    
    arbitrage.actualProfit = actualProfit;
    arbitrage.status = 'completed';
    arbitrage.endTime = new Date();
    
    const profitPercent = (actualProfit / buyTotal) * 100;
    console.log(`[Arbitrage ${arbitrage.executionId}] COMPLETED! Profit: $${actualProfit.toFixed(2)} (${profitPercent.toFixed(2)}%)`);
    
    return results;
  } catch (error) {
    arbitrage.status = 'failed';
    arbitrage.endTime = new Date();
    
    console.error(`[Arbitrage ${arbitrage.executionId}] Failed:`, error);
    
    return [{
      orderId: arbitrage.executionId,
      success: false,
      executedPrice: 0,
      executedQuantity: 0,
      fees: 0,
      slippage: 0,
      latency: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date(),
      mode: 'simulation'
    }];
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(orderId: string, exchange: string): Promise<boolean> {
  try {
    // In simulation/testnet, we can always cancel pending orders
    console.log(`Cancelling order ${orderId} on ${exchange}`);
    
    // Simulate cancellation delay
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return true;
  } catch (error) {
    console.error('Error cancelling order:', error);
    return false;
  }
}

/**
 * Create an arbitrage execution plan
 */
export function createArbitrageExecution(
  symbol: string,
  buyExchange: string,
  sellExchange: string,
  buyPrice: number,
  sellPrice: number,
  quantity: number
): ArbitrageExecution {
  const executionId = `ARB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const buyOrder: TradeOrder = {
    orderId: `BUY_${executionId}`,
    symbol,
    exchange: buyExchange,
    side: 'buy',
    quantity,
    type: 'market',
    price: buyPrice,
    status: 'pending',
    timestamp: new Date(),
    mode: 'testnet'
  };
  
  const sellOrder: TradeOrder = {
    orderId: `SELL_${executionId}`,
    symbol,
    exchange: sellExchange,
    side: 'sell',
    quantity,
    type: 'market',
    price: sellPrice,
    status: 'pending',
    timestamp: new Date(),
    mode: 'simulation'
  };
  
  const expectedProfit = (sellPrice - buyPrice) * quantity;
  
  return {
    executionId,
    buyOrder,
    sellOrder,
    expectedProfit,
    status: 'planning',
    startTime: new Date()
  };
}

/**
 * Get execution status
 */
export function getExecutionStatus(executionId: string): ArbitrageExecution | null {
  return executionLog.get(executionId) || null;
}

/**
 * Get all executions
 */
export function getAllExecutions(): ArbitrageExecution[] {
  return Array.from(executionLog.values());
}

/**
 * Get execution summary
 */
export function getExecutionSummary(execution: ArbitrageExecution): {
  duration: number;
  profitLoss: number;
  profitPercent: number;
  totalFees: number;
  successful: boolean;
} {
  const duration = execution.endTime 
    ? execution.endTime.getTime() - execution.startTime.getTime()
    : 0;
  
  const totalFees = (execution.buyResult?.fees || 0) + (execution.sellResult?.fees || 0);
  const profitLoss = execution.actualProfit || 0;
  const buyTotal = execution.buyResult 
    ? execution.buyResult.executedPrice * execution.buyResult.executedQuantity
    : 0;
  const profitPercent = buyTotal > 0 ? (profitLoss / buyTotal) * 100 : 0;
  
  return {
    duration,
    profitLoss,
    profitPercent,
    totalFees,
    successful: execution.status === 'completed' && profitLoss > 0
  };
}

export interface ExecuteArbitrageResult {
  success: boolean;
  buyPrice: number;
  buyQty: number;
  avgSellPrice: number;
  filledQty: number;
  netProfit: number;
  slippagePct: number;
  partialFill: boolean;
  auditId: string;
  error?: string;
}

/**
 * Execute arbitrage with partial fill handling and rollback
 */
export async function executeArbitrageWithPartialFills(
  opportunity: any,
  allocatedUSDT: number
): Promise<ExecuteArbitrageResult> {
  const executionId = `EXEC_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  // 1. Check BINANCE_TESTNET environment variable
  // if (process.env.BINANCE_TESTNET !== 'true') {
  //   addAuditLog({
  //     action: 'execution_aborted',
  //     component: 'executionEngine',
  //     details: { reason: 'BINANCE_TESTNET not enabled', executionId },
  //     timestamp: new Date()
  //   });
    
  //   return {
  //     success: false,
  //     buyPrice: 0, buyQty: 0, avgSellPrice: 0, filledQty: 0,
  //     netProfit: 0, slippagePct: 0, partialFill: false,
  //     auditId: executionId,
  //     error: 'BINANCE_TESTNET environment variable must be set to true'
  //   };
  // }

  try {
    const symbol = opportunity.symbol;
    const binancePrice = opportunity.binancePrice;
    
    // 2. Calculate buy quantity
    const buyQty = allocatedUSDT / binancePrice;
    
    // 3. Place BUY on Binance Testnet (market order for speed)
    addAuditLog({
      eventType: 'execution',
      action: 'buy_order_placed',
      component: 'binance_testnet',
      details: { symbol, qty: buyQty, price: binancePrice, allocatedUSDT }
    });
    
    // Simulate Binance testnet execution
    const buySlippage = 0.0001 + Math.random() * 0.0009;
    const buyPrice = binancePrice * (1 + buySlippage);
    const buyFees = buyPrice * buyQty * 0.001;
    
    addExecutionRecord({
      id: executionId,
      symbol,
      type: 'arbitrage',
      status: 'executing',
      buyExchange: 'binance_testnet',
      sellExchange: 'indian_mock',
      buyPrice,
      buyQty,
      timestamp: new Date()
    });
    
    // 4. Get Indian orderbook
    const orderbook = await getIndianOrderBook(symbol, 20);
    
    // 5. Simulate SELL across orderbook levels
    let remainingQty = buyQty;
    let totalSellValue = 0;
    let filledQty = 0;
    
    // Iterate through asks (sell side - we\'re buying from Indian exchange sellers)
    for (const [price, qty] of orderbook.asks) {
      if (remainingQty <= 0) break;
      
      const fillQty = Math.min(remainingQty, qty);
      totalSellValue += price * fillQty;
      filledQty += fillQty;
      remainingQty -= fillQty;
    }
    
    const avgSellPrice = filledQty > 0 ? totalSellValue / filledQty : 0;
    const fillRatio = filledQty / buyQty;
    const partialFill = fillRatio < 1.0;
    
    addAuditLog({
      eventType: 'execution',
      action: 'sell_simulated',
      component: 'indian_exchange',
      details: { 
        symbol, targetQty: buyQty, filledQty, fillRatio: fillRatio.toFixed(2),
        avgSellPrice, partialFill 
      }
    });
    
    // 6. Check if fill < 90% - perform rollback if needed
    if (fillRatio < 0.9) {
      addAuditLog({
        eventType: 'system',
        action: 'rollback_triggered',
        component: 'executionEngine',
        details: { 
          reason: `Fill ratio ${(fillRatio * 100).toFixed(1)}% < 90%`,
          buyQty, filledQty,
          hedgeAction: 'simulated_hedge_order'
        }
      });
      
      // Simulate hedge order on Binance
      console.log(`[ROLLBACK] Placing hedge order for unfilled ${(buyQty - filledQty).toFixed(4)} ${symbol}`);
    }
    
    // 7. Compute final metrics
    const buyCost = buyPrice * buyQty + buyFees;
    const sellRevenue = avgSellPrice * filledQty;
    const sellFees = sellRevenue * 0.002;
    const netProfit = sellRevenue - sellFees - buyCost;
    const slippagePct = ((avgSellPrice - opportunity.indianPrice) / opportunity.indianPrice) * 100;
    
    // 8. Update execution log
    updateExecutionRecord(executionId, {
      status: 'completed',
      sellPrice: avgSellPrice,
      sellQty: filledQty,
      profit: netProfit,
      partialFill,
      completedAt: new Date()
    });
    
    // 9. Update portfolio
    const portfolio = getPortfolio();
    updatePortfolio({
      cash: portfolio.cash + netProfit,
      totalValue: portfolio.totalValue + netProfit
    });
    
    // 10. Final audit entry
    addAuditLog({
      eventType: 'execution',
      action: 'execution_completed',
      component: 'executionEngine',
      details: {
        executionId, symbol, buyPrice, buyQty, avgSellPrice, filledQty,
        netProfit: netProfit.toFixed(2), slippagePct: slippagePct.toFixed(3),
        partialFill
      }
    });
    
    return {
      success: true,
      buyPrice,
      buyQty,
      avgSellPrice,
      filledQty,
      netProfit,
      slippagePct: Math.abs(slippagePct),
      partialFill,
      auditId: executionId
    };
    
  } catch (error) {
    addAuditLog({
      eventType: 'execution',
      action: 'execution_failed',
      component: 'executionEngine',
      details: { executionId, error: error instanceof Error ? error.message : 'Unknown' }
    });
    
    return {
      success: false,
      buyPrice: 0, buyQty: 0, avgSellPrice: 0, filledQty: 0,
      netProfit: 0, slippagePct: 0, partialFill: false,
      auditId: executionId,
      error: error instanceof Error ? error.message : 'Execution failed'
    };
  }
}
