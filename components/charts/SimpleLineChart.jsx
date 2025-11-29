"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  defs,
  linearGradient,
  stop
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card p-3 border border-white/10 !bg-black/80 backdrop-blur-xl shadow-xl rounded-lg">
        <p className="text-zinc-400 text-xs mb-1">{label}</p>
        <p className="text-emerald-400 font-bold font-mono text-sm">
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const SimpleLineChart = ({ data }) => {
  // Ensure data is valid and has the 'price' field
  const chartData = data?.map(item => ({
    ...item,
    price: item.price || item.close // Fallback to close if price is missing
  })) || [];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={chartData}
        margin={{
          top: 5,
          right: 10,
          left: 0,
          bottom: 0,
        }}
      >
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
        <XAxis 
          dataKey="time" 
          stroke="#52525b" 
          fontSize={10} 
          tickLine={false}
          axisLine={false}
        />
        <YAxis 
          stroke="#52525b" 
          fontSize={10} 
          tickLine={false}
          axisLine={false}
          domain={['auto', 'auto']}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area 
          type="monotone" 
          dataKey="price" 
          stroke="#3b82f6" 
          strokeWidth={2}
          fillOpacity={1} 
          fill="url(#colorPrice)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default SimpleLineChart;
