import React, { useState, useRef, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// =====================================================
// CONFIGURATION
// =====================================================
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Color palette - Costco inspired
const COLORS = {
  primary: '#E31837',      // Costco Red
  secondary: '#003DA5',    // Costco Blue
  accent: '#FFD700',       // Gold
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  dark: '#1F2937',
  light: '#F9FAFB',
  chart: ['#E31837', '#003DA5', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
};

// =====================================================
// ICONS (Simple SVG Components)
// =====================================================
const Icons = {
  Send: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Chart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Users: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  DollarSign: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Bot: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  Loader: () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  )
};

// =====================================================
// METRIC CARD COMPONENT
// =====================================================
const MetricCard = ({ title, value, icon: Icon, trend, color = 'primary' }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
        {trend && (
          <p className={`mt-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}% vs last period
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl`} style={{ backgroundColor: `${COLORS[color]}15` }}>
        <div style={{ color: COLORS[color] }}>
          <Icon />
        </div>
      </div>
    </div>
  </div>
);

// =====================================================
// CHAT MESSAGE COMPONENT
// =====================================================
const ChatMessage = ({ message, isUser, data, chartConfig, sqlQuery }) => {
  const [showSql, setShowSql] = useState(false);
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {!isUser && (
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center">
              <Icons.Bot />
            </div>
            <span className="text-sm font-medium text-gray-600">Analytics Assistant</span>
          </div>
        )}
        
        <div className={`rounded-2xl px-5 py-3 ${
          isUser 
            ? 'bg-gradient-to-r from-red-600 to-red-700 text-white' 
            : 'bg-white border border-gray-200 text-gray-800 shadow-sm'
        }`}>
          <p className="whitespace-pre-wrap leading-relaxed">{message}</p>
          
          {sqlQuery && (
            <div className="mt-3">
              <button 
                onClick={() => setShowSql(!showSql)}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                {showSql ? 'Hide SQL' : 'Show SQL Query'}
              </button>
              {showSql && (
                <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded-lg text-xs overflow-x-auto">
                  {sqlQuery}
                </pre>
              )}
            </div>
          )}
        </div>
        
        {/* Data Table */}
        {data && data.length > 0 && (
          <div className="mt-3 bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(data[0]).map(key => (
                      <th key={key} className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {key.replace(/_/g, ' ')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {data.slice(0, 10).map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      {Object.values(row).map((val, vidx) => (
                        <td key={vidx} className="px-4 py-3 text-sm text-gray-700">
                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.length > 10 && (
              <div className="px-4 py-2 bg-gray-50 text-xs text-gray-500">
                Showing 10 of {data.length} rows
              </div>
            )}
          </div>
        )}
        
        {/* Chart */}
        {chartConfig && (
          <div className="mt-3 bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">{chartConfig.title}</h4>
            <ResponsiveContainer width="100%" height={250}>
              {chartConfig.type === 'bar' ? (
                <BarChart data={chartConfig.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey={chartConfig.xAxis || 'name'} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey={chartConfig.yAxis || 'value'} fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : chartConfig.type === 'line' ? (
                <LineChart data={chartConfig.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey={chartConfig.xAxis || 'name'} tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey={chartConfig.yAxis || 'value'} stroke={COLORS.primary} strokeWidth={2} dot={{ fill: COLORS.primary }} />
                </LineChart>
              ) : (
                <PieChart>
                  <Pie data={chartConfig.data} dataKey={chartConfig.yAxis || 'value'} nameKey={chartConfig.xAxis || 'name'} cx="50%" cy="50%" outerRadius={80} label>
                    {chartConfig.data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

// =====================================================
// SUGGESTED QUESTIONS
// =====================================================
const SUGGESTED_QUESTIONS = [
  { category: "What", questions: [
    "What is our total revenue this year?",
    "What are the top 5 industries by sales?",
    "What is the conversion rate by lead source?"
  ]},
  { category: "Why", questions: [
    "Why did Warehouse 120 underperform last quarter?",
    "Why are Restaurant leads converting better than Retail?",
    "Why did sales drop in Period 6?"
  ]},
  { category: "Predict", questions: [
    "What will revenue look like next month?",
    "Which leads are most likely to convert?",
    "Forecast sales for the next 30 days"
  ]},
  { category: "Recommend", questions: [
    "Which marketers should focus on which industries?",
    "What should we do to improve conversion rates?",
    "Where should we allocate marketing resources?"
  ]}
];

// =====================================================
// MAIN APP COMPONENT
// =====================================================
export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [metrics, setMetrics] = useState(null);
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Fetch dashboard metrics
  useEffect(() => {
    fetchMetrics();
  }, []);
  
  const fetchMetrics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/metrics`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      // Use mock data for demo
      setMetrics({
        total_revenue: 2456789.50,
        total_members: 1247,
        conversion_rate: 0.285,
        avg_transaction_value: 387.45,
        revenue_by_warehouse: { '115': 456789, '120': 789012, '130': 567890, '140': 345678, '150': 297420 },
        revenue_by_industry: { 'CAFE': 345678, 'REST': 567890, 'RETL': 234567, 'GROC': 678901, 'CSTR': 456789, 'HOTL': 172964 },
        lead_funnel: { 'New': 120, 'Contacted': 89, 'Qualified': 67, 'Proposal': 45, 'Converted': 143, 'Lost': 36 },
        top_marketers: [
          { marketer_name: 'John Smith', leads: 78, conversions: 23, influenced_revenue: 156789 },
          { marketer_name: 'Emily Davis', leads: 65, conversions: 19, influenced_revenue: 134567 },
          { marketer_name: 'Marcus Thompson', leads: 54, conversions: 17, influenced_revenue: 98765 }
        ]
      });
    }
  };
  
  const sendMessage = async (text = input) => {
    if (!text.trim()) return;
    
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          conversation_history: messages.slice(-10)
        })
      });
      
      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        data: data.data,
        chartConfig: data.chart_config,
        sqlQuery: data.sql_query
      }]);
    } catch (error) {
      // Demo fallback response
      const demoResponses = {
        'revenue': {
          content: "Based on the data, your total revenue for the current fiscal year is **$2,456,789.50**. Here's the breakdown:\n\n• Warehouse 120 (Los Angeles) leads with $789,012 (32%)\n• Warehouse 130 (Seattle) follows at $567,890 (23%)\n• Warehouse 115 (Las Vegas) generated $456,789 (19%)\n\nGrocery Stores (GROC) is your top-performing industry at $678,901, followed by Restaurants (REST) at $567,890.",
          data: [
            { warehouse: '120', revenue: 789012, percentage: 32 },
            { warehouse: '130', revenue: 567890, percentage: 23 },
            { warehouse: '115', revenue: 456789, percentage: 19 },
            { warehouse: '140', revenue: 345678, percentage: 14 },
            { warehouse: '150', revenue: 297420, percentage: 12 }
          ],
          chartConfig: {
            type: 'bar',
            title: 'Revenue by Warehouse',
            data: [
              { name: 'WH 120', value: 789012 },
              { name: 'WH 130', value: 567890 },
              { name: 'WH 115', value: 456789 },
              { name: 'WH 140', value: 345678 },
              { name: 'WH 150', value: 297420 }
            ],
            xAxis: 'name',
            yAxis: 'value'
          }
        },
        'conversion': {
          content: "Your overall lead conversion rate is **28.5%**, which is strong for B2B wholesale.\n\n**By Lead Source:**\n• Referrals: 42% conversion (best performing)\n• Events: 35% conversion\n• Website: 28% conversion\n• Cold Calls: 18% conversion\n• Partners: 22% conversion\n\n**Insight:** Referrals convert at 2.3x the rate of cold calls. Consider incentivizing existing members for referrals.",
          chartConfig: {
            type: 'bar',
            title: 'Conversion Rate by Lead Source',
            data: [
              { name: 'Referral', value: 42 },
              { name: 'Event', value: 35 },
              { name: 'Website', value: 28 },
              { name: 'Partner', value: 22 },
              { name: 'Cold Call', value: 18 }
            ]
          }
        },
        'why': {
          content: "Analyzing the performance gap for Warehouse 120...\n\n**Root Causes Identified:**\n\n1. **Marketer Capacity**: 2 of 4 marketers were at 120% workload during Q3\n2. **Industry Mix**: Higher concentration of Construction leads (slower conversion cycle)\n3. **Seasonal Factor**: 15% drop in Restaurant leads during summer months\n\n**Recommendation:** Reallocate 20% of Construction leads to Warehouse 130 and focus Warehouse 120 marketers on high-probability Restaurant and Cafe leads."
        },
        'forecast': {
          content: "Based on the ARIMA+ forecasting model, here's your 30-day revenue prediction:\n\n**Total Projected Revenue: $287,450** (±12%)\n\n**By Warehouse:**\n• WH 120: $92,300 (↑ 8% vs last month)\n• WH 130: $67,200 (→ stable)\n• WH 115: $54,800 (↑ 5%)\n• WH 140: $41,150 (↓ 3%)\n• WH 150: $32,000 (↑ 2%)\n\n**Key Drivers:** Seasonal uptick in Restaurant orders expected, plus 12 high-probability leads in pipeline.",
          chartConfig: {
            type: 'line',
            title: '30-Day Revenue Forecast',
            data: [
              { name: 'Week 1', value: 68500, forecast: 71200 },
              { name: 'Week 2', value: 72300, forecast: 74800 },
              { name: 'Week 3', value: 69800, forecast: 72100 },
              { name: 'Week 4', value: 71200, forecast: 69350 }
            ]
          }
        },
        'default': {
          content: "I can help you analyze your Costco Business Center data. Try asking me:\n\n• **What**: 'What is our revenue by industry?'\n• **Why**: 'Why did conversions drop last month?'\n• **Predict**: 'Forecast next month's sales'\n• **Recommend**: 'Which leads should we prioritize?'"
        }
      };
      
      let responseKey = 'default';
      const lowerText = text.toLowerCase();
      if (lowerText.includes('revenue') || lowerText.includes('sales') || lowerText.includes('total')) {
        responseKey = 'revenue';
      } else if (lowerText.includes('conversion') || lowerText.includes('convert')) {
        responseKey = 'conversion';
      } else if (lowerText.includes('why') || lowerText.includes('underperform')) {
        responseKey = 'why';
      } else if (lowerText.includes('forecast') || lowerText.includes('predict') || lowerText.includes('next')) {
        responseKey = 'forecast';
      }
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        ...demoResponses[responseKey]
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Prepare chart data from metrics
  const revenueByWarehouseData = metrics ? Object.entries(metrics.revenue_by_warehouse).map(([k, v]) => ({
    name: `WH ${k}`,
    value: v
  })) : [];
  
  const revenueByIndustryData = metrics ? Object.entries(metrics.revenue_by_industry).map(([k, v]) => ({
    name: k,
    value: v
  })) : [];
  
  const funnelData = metrics ? [
    { name: 'New', value: metrics.lead_funnel['New'] || 0 },
    { name: 'Contacted', value: metrics.lead_funnel['Contacted'] || 0 },
    { name: 'Qualified', value: metrics.lead_funnel['Qualified'] || 0 },
    { name: 'Proposal', value: metrics.lead_funnel['Proposal'] || 0 },
    { name: 'Converted', value: metrics.lead_funnel['Converted'] || 0 }
  ] : [];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Costco Business Center</h1>
                <p className="text-xs text-gray-500">AI-Powered Analytics Platform</p>
              </div>
            </div>
            
            {/* Tab Navigation */}
            <nav className="flex gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icons.Sparkles /> Talk to Data
                </span>
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === 'dashboard' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Icons.Chart /> Dashboard
                </span>
              </button>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'chat' ? (
          // =====================================================
          // CHAT INTERFACE
          // =====================================================
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Suggested Questions Sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Icons.Sparkles /> Ask Me About
                </h3>
                {SUGGESTED_QUESTIONS.map((category, idx) => (
                  <div key={idx} className="mb-4">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      {category.category}
                    </h4>
                    <div className="space-y-2">
                      {category.questions.map((q, qidx) => (
                        <button
                          key={qidx}
                          onClick={() => sendMessage(q)}
                          className="w-full text-left text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Chat Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 180px)' }}>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-red-500 to-blue-600 flex items-center justify-center">
                        <Icons.Bot />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Analytics Assistant</h3>
                      <p className="text-gray-500 max-w-md mx-auto">
                        Ask me anything about your sales, leads, member behavior, and performance. I can answer questions, show charts, and provide predictions.
                      </p>
                    </div>
                  )}
                  
                  {messages.map((msg, idx) => (
                    <ChatMessage
                      key={idx}
                      message={msg.content}
                      isUser={msg.role === 'user'}
                      data={msg.data}
                      chartConfig={msg.chartConfig}
                      sqlQuery={msg.sqlQuery}
                    />
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-center gap-3 text-gray-500">
                      <Icons.Loader />
                      <span className="text-sm">Analyzing your data...</span>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
                
                {/* Input Area */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask about revenue, conversions, forecasts..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={isLoading || !input.trim()}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md"
                    >
                      <Icons.Send />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // =====================================================
          // DASHBOARD
          // =====================================================
          <div className="space-y-6">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard 
                title="Total Revenue" 
                value={metrics ? `$${(metrics.total_revenue / 1000000).toFixed(2)}M` : '$--'} 
                icon={Icons.DollarSign}
                trend={8.5}
                color="primary"
              />
              <MetricCard 
                title="Active Members" 
                value={metrics ? metrics.total_members.toLocaleString() : '--'}
                icon={Icons.Users}
                trend={12.3}
                color="secondary"
              />
              <MetricCard 
                title="Conversion Rate" 
                value={metrics ? `${(metrics.conversion_rate * 100).toFixed(1)}%` : '--%'}
                icon={Icons.TrendingUp}
                trend={-2.1}
                color="success"
              />
              <MetricCard 
                title="Avg Transaction" 
                value={metrics ? `$${metrics.avg_transaction_value.toFixed(0)}` : '$--'}
                icon={Icons.Chart}
                trend={5.7}
                color="warning"
              />
            </div>
            
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue by Warehouse */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Warehouse</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={revenueByWarehouseData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
                    <Bar dataKey="value" fill={COLORS.primary} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Revenue by Industry */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Industry</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie 
                      data={revenueByIndustryData} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={100}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {revenueByIndustryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, 'Revenue']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Lead Funnel & Top Marketers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Funnel */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Funnel</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={funnelData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="value" stroke={COLORS.secondary} fill={`${COLORS.secondary}30`} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              
              {/* Top Marketers */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Marketers</h3>
                <div className="space-y-4">
                  {metrics?.top_marketers?.map((marketer, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-400'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{marketer.marketer_name}</p>
                          <p className="text-sm text-gray-500">{marketer.leads} leads • {marketer.conversions} converted</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${(marketer.influenced_revenue / 1000).toFixed(0)}k</p>
                        <p className="text-xs text-gray-500">influenced revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
