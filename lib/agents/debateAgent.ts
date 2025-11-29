// Multi-Agent Debate System with Groq AI

import Groq from 'groq-sdk';

export interface AgentArgument {
  agentName: string;
  role: 'price_discovery' | 'risk_assessment' | 'capital_allocation' | 'execution' | 'market_analyst';
  stance: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-1
  reasoning: string;
  evidence: any[];
  timestamp: Date;
}

export interface DebateRound {
  roundNumber: number;
  arguments: AgentArgument[];
  consensus?: 'proceed' | 'abort' | 'needs_more_data';
  timestamp: Date;
}

export interface DebateSession {
  sessionId: string;
  topic: string; // e.g., "Execute BTC/USDT arbitrage between Binance and WazirX"
  rounds: DebateRound[];
  finalDecision?: 'proceed' | 'abort';
  finalConsensus?: number; // 0-1
  participants: string[];
  startTime: Date;
  endTime?: Date;
}

// In-memory debate sessions storage
const debateSessions: Map<string, DebateSession> = new Map();

// Initialize Groq client (API key from environment)
let groqClient: Groq | null = null;

function getGroqClient(): Groq | null {
  if (groqClient) return groqClient;
  
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('GROQ_API_KEY not set. Debate agent will use fallback reasoning.');
    return null;
  }
  
  groqClient = new Groq({ apiKey });
  return groqClient;
}

/**
 * Generate bullish argument using Groq API
 */
async function generateBullishArgument(
  topic: string,
  context: any
): Promise<AgentArgument> {
  const client = getGroqClient();
  
  let reasoning: string;
  let confidence: number;
  
  if (client) {
    try {
      const prompt = `You are a bullish market analyst evaluating an arbitrage opportunity.

Topic: ${topic}

Context:
- Symbol: ${context.symbol || 'BTC/USDT'}
- Buy Exchange: ${context.buyExchange || 'Binance'}
- Sell Exchange: ${context.sellExchange || 'WazirX'}
- Buy Price: $${context.buyPrice || 50000}
- Sell Price: $${context.sellPrice || 50750}
- Spread: ${context.spread || 1.5}%
- Risk Score: ${context.riskScore || 0.3}/1.0

Provide a BULLISH argument for why this arbitrage trade SHOULD be executed. Focus on:
1. Profit potential and spread size
2. Market conditions favoring the trade
3. Execution feasibility
4. Opportunity cost of NOT taking the trade

Keep your response to 3-4 concise bullet points. Be specific and data-driven.`;

      const completion = await client.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 300
      });
      
      reasoning = completion.choices[0]?.message?.content || 'No reasoning provided';
      
      // Calculate confidence based on spread and risk
      confidence = Math.min(0.9, (context.spread || 1) / 2 * (1 - (context.riskScore || 0.3)));
      
    } catch (error) {
      console.error('Groq API error (bullish):', error);
      reasoning = fallbackBullishReasoning(context);
      confidence = 0.6;
    }
  } else {
    reasoning = fallbackBullishReasoning(context);
    confidence = 0.6;
  }
  
  return {
    agentName: 'Bullish Analyst',
    role: 'market_analyst',
    stance: 'bullish',
    confidence,
    reasoning,
    evidence: [context],
    timestamp: new Date()
  };
}

/**
 * Generate bearish argument using Groq API
 */
async function generateBearishArgument(
  topic: string,
  context: any
): Promise<AgentArgument> {
  const client = getGroqClient();
  
  let reasoning: string;
  let confidence: number;
  
  if (client) {
    try {
      const prompt = `You are a bearish market analyst evaluating an arbitrage opportunity.

Topic: ${topic}

Context:
- Symbol: ${context.symbol || 'BTC/USDT'}
- Buy Exchange: ${context.buyExchange || 'Binance'}
- Sell Exchange: ${context.sellExchange || 'WazirX'}
- Buy Price: $${context.buyPrice || 50000}
- Sell Price: $${context.sellPrice || 50750}
- Spread: ${context.spread || 1.5}%
- Risk Score: ${context.riskScore || 0.3}/1.0
- Volatility: ${context.volatility || 'Medium'}
- Liquidity: ${context.liquidity || 'Good'}

Provide a BEARISH argument for why this arbitrage trade should NOT be executed. Focus on:
1. Risks and potential pitfalls
2. Execution challenges (slippage, fees, timing)
3. Market conditions that could erode profit
4. Better alternative opportunities

Keep your response to 3-4 concise bullet points. Be specific and data-driven.`;

      const completion = await client.chat.completions.create({
        model: 'llama-3.1-70b-versatile',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 300
      });
      
      reasoning = completion.choices[0]?.message?.content || 'No reasoning provided';
      
      // Calculate confidence based on risk factors
      confidence = Math.min(0.9, (context.riskScore || 0.3) + 0.3);
      
    } catch (error) {
      console.error('Groq API error (bearish):', error);
      reasoning = fallbackBearishReasoning(context);
      confidence = 0.6;
    }
  } else {
    reasoning = fallbackBearishReasoning(context);
    confidence = 0.6;
  }
  
  return {
    agentName: 'Bearish Analyst',
    role: 'market_analyst',
    stance: 'bearish',
    confidence,
    reasoning,
    evidence: [context],
    timestamp: new Date()
  };
}

/**
 * Fallback bullish reasoning (when API unavailable)
 */
function fallbackBullishReasoning(context: any): string {
  const spread = context.spread || 1.5;
  const risk = context.riskScore || 0.3;
  
  return `• Strong ${spread.toFixed(2)}% spread provides healthy profit margin above fees and slippage
• Low risk score (${(risk * 100).toFixed(0)}%) indicates stable market conditions
• Both exchanges have sufficient liquidity for smooth execution
• Time-sensitive opportunity - spread may narrow if not acted upon quickly`;
}

/**
 * Fallback bearish reasoning (when API unavailable)
 */
function fallbackBearishReasoning(context: any): string {
  const risk = context.riskScore || 0.3;
  
  return `• Execution across two exchanges introduces timing risk and potential for slippage
• ${(risk * 100).toFixed(0)}% risk score suggests market volatility could erode gains
• Transaction fees and withdrawal fees will reduce net profit significantly
• Spread may be artificially wide due to temporary liquidity imbalance`;
}

/**
 * Initialize a new debate session
 */
export async function startDebate(
  topic: string,
  context: any
): Promise<DebateSession> {
  const sessionId = `DEBATE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session: DebateSession = {
    sessionId,
    topic,
    rounds: [],
    participants: ['Bullish Analyst', 'Bearish Analyst', 'Risk Assessor', 'Execution Agent'],
    startTime: new Date()
  };
  
  debateSessions.set(sessionId, session);
  
  return session;
}

/**
 * Conduct a single round of debate
 * Generates both bullish and bearish arguments using Groq
 */
export async function conductDebateRound(
  session: DebateSession,
  context: any
): Promise<DebateRound> {
  const roundNumber = session.rounds.length + 1;
  
  // Generate both perspectives in parallel
  const [bullishArg, bearishArg] = await Promise.all([
    generateBullishArgument(session.topic, context),
    generateBearishArgument(session.topic, context)
  ]);
  
  const args: AgentArgument[] = [bullishArg, bearishArg];
  
  // Determine consensus based on argument strengths
  let consensus: 'proceed' | 'abort' | 'needs_more_data';
  
  const bullishWeight = bullishArg.confidence;
  const bearishWeight = bearishArg.confidence;
  const netSentiment = bullishWeight - bearishWeight;
  
  if (Math.abs(netSentiment) < 0.2) {
    consensus = 'needs_more_data';
  } else if (netSentiment > 0) {
    consensus = 'proceed';
  } else {
    consensus = 'abort';
  }
  
  const round: DebateRound = {
    roundNumber,
    arguments: args,
    consensus,
    timestamp: new Date()
  };
  
  session.rounds.push(round);
  
  return round;
}

/**
 * Reach final consensus from debate
 */
export async function reachConsensus(
  session: DebateSession
): Promise<{
  decision: 'proceed' | 'abort';
  confidence: number;
  explanation: string;
}> {
  if (session.rounds.length === 0) {
    return {
      decision: 'abort',
      confidence: 0,
      explanation: 'No debate rounds conducted'
    };
  }
  
  // Aggregate all arguments
  let totalBullish = 0;
  let totalBearish = 0;
  let countBullish = 0;
  let countBearish = 0;
  
  for (const round of session.rounds) {
    for (const arg of round.arguments) {
      if (arg.stance === 'bullish') {
        totalBullish += arg.confidence;
        countBullish++;
      } else if (arg.stance === 'bearish') {
        totalBearish += arg.confidence;
        countBearish++;
      }
    }
  }
  
  const avgBullish = countBullish > 0 ? totalBullish / countBullish : 0;
  const avgBearish = countBearish > 0 ? totalBearish / countBearish : 0;
  
  const netSentiment = avgBullish - avgBearish;
  const decision: 'proceed' | 'abort' = netSentiment > 0 ? 'proceed' : 'abort';
  const confidence = Math.abs(netSentiment);
  
  let explanation = '';
  if (decision === 'proceed') {
    explanation = `After ${session.rounds.length} round(s) of analysis, the bullish case is stronger. `;
    explanation += `Bullish confidence: ${(avgBullish * 100).toFixed(1)}%, `;
    explanation += `Bearish confidence: ${(avgBearish * 100).toFixed(1)}%. `;
    explanation += `Recommendation: Proceed with trade execution.`;
  } else {
    explanation = `After ${session.rounds.length} round(s) of analysis, the bearish case is stronger. `;
    explanation += `Bearish confidence: ${(avgBearish * 100).toFixed(1)}%, `;
    explanation += `Bullish confidence: ${(avgBullish * 100).toFixed(1)}%. `;
    explanation += `Recommendation: Abort trade to avoid potential losses.`;
  }
  
  session.finalDecision = decision;
  session.finalConsensus = confidence;
  session.endTime = new Date();
  
  return {
    decision,
    confidence,
    explanation
  };
}

/**
 * Get debate history for visualization
 */
export async function getDebateHistory(sessionId: string): Promise<DebateSession | null> {
  return debateSessions.get(sessionId) || null;
}

/**
 * Quick debate for immediate decision
 * Runs one round and returns consensus
 */
export async function quickDebate(
  topic: string,
  context: any
): Promise<{
  decision: 'proceed' | 'abort';
  confidence: number;
  explanation: string;
  bullishReasoning: string;
  bearishReasoning: string;
}> {
  const session = await startDebate(topic, context);
  const round = await conductDebateRound(session, context);
  const consensus = await reachConsensus(session);
  
  const bullishArg = round.arguments.find(a => a.stance === 'bullish');
  const bearishArg = round.arguments.find(a => a.stance === 'bearish');
  
  return {
    ...consensus,
    bullishReasoning: bullishArg?.reasoning || 'No bullish argument',
    bearishReasoning: bearishArg?.reasoning || 'No bearish argument'
  };
}

export interface AgentPerspective {
  score: number; // 0-1
  reasons: string[];
}

export interface DebateResult {
  bullish: AgentPerspective;
  bearish: AgentPerspective;
  neutral: AgentPerspective;
  finalDecisionScore: number;
  decision: 'execute' | 'wait';
  raw: string;
}

/**
 * Conduct debate with median consensus using Groq llama-3.3-70b-versatile
 */
export async function debateWithMedianConsensus(
  opportunity: any,
  risk: any,
  allocation: any,
  executeConfidenceThreshold: number = 0.6
): Promise<DebateResult> {
  const client = getGroqClient();
  
  if (!client) {
    return fallbackDebateResult(opportunity, risk, allocation, executeConfidenceThreshold);
  }

  try {
    const prompt = `You are a multi-agent trading system evaluating an arbitrage opportunity.

OPPORTUNITY: Symbol ${opportunity.symbol}, Spread ${opportunity.spreadPct}%, Profit ${opportunity.estimatedGrossProfitPct}%
RISK: Score ${risk.riskScore}/100, Slippage ${risk.slippagePct}%, Volatility ${risk.volatilityPct}%
ALLOCATION: ${allocation.allocationPct * 100}%, $${allocation.allocatedUSDT}

Provide THREE agent perspectives in STRICT JSON format:
{
  "bullish": {"score": <0-1>, "reasons": ["reason 1", "reason 2", "reason 3"]},
  "bearish": {"score": <0-1>, "reasons": ["reason 1", "reason 2", "reason 3"]},
  "neutral": {"score": <0-1>, "reasons": ["reason 1", "reason 2"]}
}
Respond ONLY with JSON, no other text.`;

    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 600
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const jsonMatch = raw.match(/{[\s\S]*}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);

    const bullish: AgentPerspective = {
      score: Math.max(0, Math.min(1, parsed.bullish.score || 0)),
      reasons: Array.isArray(parsed.bullish.reasons) ? parsed.bullish.reasons.slice(0, 3) : []
    };
    const bearish: AgentPerspective = {
      score: Math.max(0, Math.min(1, parsed.bearish.score || 0)),
      reasons: Array.isArray(parsed.bearish.reasons) ? parsed.bearish.reasons.slice(0, 3) : []
    };
    const neutral: AgentPerspective = {
      score: Math.max(0, Math.min(1, parsed.neutral.score || 0)),
      reasons: Array.isArray(parsed.neutral.reasons) ? parsed.neutral.reasons.slice(0, 2) : []
    };

    const scores = [bullish.score, 1 - bearish.score, neutral.score];
    scores.sort((a, b) => a - b);
    const finalDecisionScore = scores[1];

    return {
      bullish, bearish, neutral,
      finalDecisionScore,
      decision: finalDecisionScore >= executeConfidenceThreshold ? 'execute' : 'wait',
      raw
    };
  } catch (error) {
    return fallbackDebateResult(opportunity, risk, allocation, executeConfidenceThreshold);
  }
}

function fallbackDebateResult(o: any, r: any, a: any, t: number): DebateResult {
  const spreadScore = Math.min(1, o.spreadPct / 3);
  const riskPenalty = r.riskScore / 100;
  const bullish = { score: Math.max(0, Math.min(1, spreadScore - riskPenalty * 0.3)), reasons: [`Spread ${o.spreadPct.toFixed(2)}%`, `Allocated $${a.allocatedUSDT}`, `Time-sensitive`] };
  const bearish = { score: Math.max(0, Math.min(1, riskPenalty)), reasons: [`Risk ${r.riskScore}/100`, `Slippage ${r.slippagePct.toFixed(2)}%`, `Volatility risk`] };
  const neutral = { score: 0.5, reasons: [`Balanced risk-reward`, `Conservative allocation`] };
  const scores = [bullish.score, 1 - bearish.score, neutral.score];
  scores.sort((a, b) => a - b);
  return { bullish, bearish, neutral, finalDecisionScore: scores[1], decision: scores[1] >= t ? 'execute' : 'wait', raw: 'Fallback' };
}
