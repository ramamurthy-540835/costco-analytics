"""
Costco Business Center Analytics API
FastAPI Backend with Vertex AI Gemini Integration for Talk-to-Data
"""
import os
import json
from datetime import datetime, timedelta
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    Tool,
    FunctionDeclaration,
    Part,
    Content,
    GenerationConfig
)
from google.cloud import bigquery

# Initialize FastAPI
app = FastAPI(
    title="Costco Business Center Analytics API",
    description="AI-Powered Analytics with Talk-to-Data Capability",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
PROJECT_ID = os.getenv("GCP_PROJECT_ID", "your-project-id")
LOCATION = os.getenv("GCP_LOCATION", "us-central1")
DATASET_ID = "costco_analytics"

# Initialize Vertex AI
vertexai.init(project=PROJECT_ID, location=LOCATION)

# Initialize BigQuery Client
bq_client = bigquery.Client(project=PROJECT_ID)

# =====================================================
# PYDANTIC MODELS
# =====================================================
class ChatMessage(BaseModel):
    role: str  # 'user' or 'assistant'
    content: str

class ChatRequest(BaseModel):
    message: str
    conversation_history: Optional[List[ChatMessage]] = []

class ChatResponse(BaseModel):
    response: str
    sql_query: Optional[str] = None
    data: Optional[List[Dict]] = None
    chart_config: Optional[Dict] = None
    insights: Optional[List[str]] = None

class DashboardMetrics(BaseModel):
    total_revenue: float
    total_members: int
    conversion_rate: float
    avg_transaction_value: float
    revenue_by_warehouse: Dict[str, float]
    revenue_by_industry: Dict[str, float]
    lead_funnel: Dict[str, int]
    top_marketers: List[Dict]

# =====================================================
# SCHEMA CONTEXT FOR LLM
# =====================================================
SCHEMA_CONTEXT = """
You are an expert analytics assistant for Costco Business Center. You help analyze sales data, lead conversions, member behavior, and business performance.

## Available Tables in BigQuery:

### costco_analytics.warehouses
- warehouse_id (INT64): Unique warehouse identifier (115, 120, 130, 140, 150)
- warehouse_name (STRING): Full name like "Business Center #120"
- region (STRING): West, Northwest, Southwest, Central
- city (STRING): City location
- state (STRING): State code

### costco_analytics.marketers
- marketer_id (INT64): Unique marketer ID
- marketer_name (STRING): Full name
- warehouse_id (INT64): Assigned warehouse
- is_active (BOOL): Currently active

### costco_analytics.industries
- industry_code (STRING): CAFE, REST, RETL, GROC, CSTR, HOTL, OFFC
- industry_description (STRING): Full description
- category (STRING): Food Service, Retail, Industrial, Hospitality, Corporate
- avg_order_value (FLOAT64): Average expected order value

### costco_analytics.leads
- lead_id (INT64): Unique lead ID
- warehouse_id (INT64): Associated warehouse
- marketer_id (INT64): Assigned marketer
- industry_code (STRING): Industry category
- lead_source (STRING): Referral, Cold Call, Website, Event, Partner
- business_name (STRING): Business name
- estimated_value (FLOAT64): Estimated annual value
- touch_point_count (INT64): Number of interactions
- status (STRING): New, Contacted, Qualified, Proposal, Converted, Lost
- created_at (TIMESTAMP): Lead creation date
- converted_at (TIMESTAMP): Conversion date (if converted)
- conversion_days (INT64): Days from creation to conversion

### costco_analytics.members
- member_id (INT64): Unique member ID
- warehouse_id (INT64): Home warehouse
- industry_code (STRING): Industry category
- membership_type (STRING): Business, Business Executive, Gold Star Business
- lifetime_value (FLOAT64): Total historical spend
- joined_at (TIMESTAMP): Membership start date
- is_active (BOOL): Active membership

### costco_analytics.pos_sales
- sale_id (INT64): Transaction ID
- warehouse_id (INT64): Transaction location
- member_id (INT64): Purchasing member
- fiscal_year (INT64): Fiscal year (2025, 2026)
- fiscal_period (INT64): Period 1-12
- fiscal_week (INT64): Week 1-4
- sale_date (DATE): Transaction date
- transaction_count (INT64): Number of items
- amount (FLOAT64): Transaction value
- shop_type (STRING): Walk-in, Online, Phone Order
- industry_code (STRING): Member's industry

### costco_analytics.lead_touchpoints
- touchpoint_id (INT64): Interaction ID
- lead_id (INT64): Associated lead
- marketer_id (INT64): Marketer who made contact
- touchpoint_type (STRING): Call, Email, Meeting, Demo, Proposal
- outcome (STRING): Positive, Neutral, Negative, No Response

## Analytics Capabilities:
1. **Descriptive (WHAT)**: Summarize data, show trends, aggregate metrics
2. **Diagnostic (WHY)**: Compare segments, analyze correlations, find root causes
3. **Predictive (WHAT WILL HAPPEN)**: Use ML models for forecasting
4. **Prescriptive (WHAT SHOULD I DO)**: Recommend actions based on insights

## Response Guidelines:
- Generate valid BigQuery SQL when data queries are needed
- Explain insights in business-friendly language
- Suggest relevant follow-up questions
- When analyzing "why" something happened, compare across dimensions (time, warehouse, industry, marketer)
- For predictions, reference the ML models available (sales_forecast_model, lead_conversion_model)
"""

# =====================================================
# TOOL DEFINITIONS FOR GEMINI
# =====================================================
query_database = FunctionDeclaration(
    name="query_database",
    description="Execute a SQL query against the Costco analytics BigQuery database to retrieve data",
    parameters={
        "type": "object",
        "properties": {
            "sql_query": {
                "type": "string",
                "description": "Valid BigQuery SQL query to execute"
            },
            "explanation": {
                "type": "string",
                "description": "Brief explanation of what this query retrieves"
            }
        },
        "required": ["sql_query", "explanation"]
    }
)

get_sales_forecast = FunctionDeclaration(
    name="get_sales_forecast",
    description="Get sales revenue forecast using the ARIMA+ ML model",
    parameters={
        "type": "object",
        "properties": {
            "warehouse_id": {
                "type": "integer",
                "description": "Warehouse ID to forecast (optional, all if not specified)"
            },
            "horizon_days": {
                "type": "integer",
                "description": "Number of days to forecast (default 30)"
            }
        },
        "required": []
    }
)

get_lead_conversion_probability = FunctionDeclaration(
    name="get_lead_conversion_probability",
    description="Predict conversion probability for leads using the ML model",
    parameters={
        "type": "object",
        "properties": {
            "lead_status": {
                "type": "string",
                "description": "Filter by lead status (e.g., 'Qualified', 'Proposal')"
            },
            "warehouse_id": {
                "type": "integer",
                "description": "Filter by warehouse"
            }
        },
        "required": []
    }
)

generate_chart = FunctionDeclaration(
    name="generate_chart",
    description="Generate a chart configuration for visualization",
    parameters={
        "type": "object",
        "properties": {
            "chart_type": {
                "type": "string",
                "enum": ["bar", "line", "pie", "area", "scatter"],
                "description": "Type of chart to generate"
            },
            "title": {
                "type": "string",
                "description": "Chart title"
            },
            "data": {
                "type": "array",
                "description": "Data points for the chart"
            },
            "x_axis": {
                "type": "string",
                "description": "X-axis field name"
            },
            "y_axis": {
                "type": "string",
                "description": "Y-axis field name"
            }
        },
        "required": ["chart_type", "title", "data"]
    }
)

# Create tools
analytics_tools = Tool(function_declarations=[
    query_database,
    get_sales_forecast,
    get_lead_conversion_probability,
    generate_chart
])

# =====================================================
# TOOL EXECUTION FUNCTIONS
# =====================================================
def execute_query(sql_query: str) -> List[Dict]:
    """Execute BigQuery SQL and return results"""
    try:
        # Add dataset prefix if not present
        sql_query = sql_query.replace("costco_analytics.", f"{PROJECT_ID}.{DATASET_ID}.")
        
        query_job = bq_client.query(sql_query)
        results = query_job.result()
        
        data = []
        for row in results:
            data.append(dict(row))
        
        return data
    except Exception as e:
        return [{"error": str(e)}]

def execute_sales_forecast(warehouse_id: Optional[int] = None, horizon_days: int = 30) -> List[Dict]:
    """Execute sales forecast using BigQuery ML"""
    warehouse_filter = f"WHERE warehouse_id = {warehouse_id}" if warehouse_id else ""
    
    sql = f"""
    SELECT
        warehouse_id,
        forecast_timestamp as forecast_date,
        forecast_value as predicted_revenue,
        prediction_interval_lower_bound as lower_bound,
        prediction_interval_upper_bound as upper_bound
    FROM ML.FORECAST(
        MODEL `{PROJECT_ID}.{DATASET_ID}.sales_forecast_model`,
        STRUCT({horizon_days} AS horizon, 0.95 AS confidence_level)
    )
    {warehouse_filter}
    ORDER BY warehouse_id, forecast_timestamp
    """
    
    return execute_query(sql)

def execute_lead_prediction(lead_status: Optional[str] = None, warehouse_id: Optional[int] = None) -> List[Dict]:
    """Predict lead conversion probabilities"""
    filters = []
    if lead_status:
        filters.append(f"status = '{lead_status}'")
    if warehouse_id:
        filters.append(f"warehouse_id = {warehouse_id}")
    
    where_clause = "WHERE " + " AND ".join(filters) if filters else ""
    
    sql = f"""
    SELECT 
        lead_id,
        business_name,
        industry_code,
        marketer_id,
        estimated_value,
        predicted_is_converted_probs[OFFSET(1)].prob as conversion_probability
    FROM ML.PREDICT(
        MODEL `{PROJECT_ID}.{DATASET_ID}.lead_conversion_model`,
        (SELECT * FROM `{PROJECT_ID}.{DATASET_ID}.leads` {where_clause})
    )
    ORDER BY conversion_probability DESC
    LIMIT 20
    """
    
    return execute_query(sql)

def process_tool_call(tool_name: str, args: Dict) -> Dict:
    """Process a tool call and return results"""
    if tool_name == "query_database":
        data = execute_query(args.get("sql_query", ""))
        return {
            "explanation": args.get("explanation", ""),
            "data": data[:100],  # Limit results
            "row_count": len(data)
        }
    elif tool_name == "get_sales_forecast":
        data = execute_sales_forecast(
            args.get("warehouse_id"),
            args.get("horizon_days", 30)
        )
        return {"forecast": data}
    elif tool_name == "get_lead_conversion_probability":
        data = execute_lead_prediction(
            args.get("lead_status"),
            args.get("warehouse_id")
        )
        return {"predictions": data}
    elif tool_name == "generate_chart":
        return {
            "chart_config": {
                "type": args.get("chart_type", "bar"),
                "title": args.get("title", "Chart"),
                "data": args.get("data", []),
                "xAxis": args.get("x_axis"),
                "yAxis": args.get("y_axis")
            }
        }
    return {"error": f"Unknown tool: {tool_name}"}

# =====================================================
# GEMINI CHAT FUNCTION
# =====================================================
async def chat_with_gemini(message: str, history: List[ChatMessage] = []) -> ChatResponse:
    """Process a chat message using Gemini with tools"""
    
    # Initialize model with tools
    model = GenerativeModel(
        "gemini-2.0-flash-001",
        tools=[analytics_tools],
        system_instruction=SCHEMA_CONTEXT
    )
    
    # Build conversation history
    contents = []
    for msg in history:
        role = "user" if msg.role == "user" else "model"
        contents.append(Content(role=role, parts=[Part.from_text(msg.content)]))
    
    # Add current message
    contents.append(Content(role="user", parts=[Part.from_text(message)]))
    
    # Generate response
    chat = model.start_chat(history=contents[:-1])
    response = chat.send_message(contents[-1].parts[0].text)
    
    # Process tool calls if any
    sql_query = None
    data = None
    chart_config = None
    insights = []
    
    # Check for function calls
    if response.candidates[0].content.parts:
        for part in response.candidates[0].content.parts:
            if hasattr(part, 'function_call') and part.function_call:
                fc = part.function_call
                tool_result = process_tool_call(fc.name, dict(fc.args))
                
                if fc.name == "query_database":
                    sql_query = fc.args.get("sql_query")
                    data = tool_result.get("data")
                elif fc.name == "generate_chart":
                    chart_config = tool_result.get("chart_config")
                
                # Send tool result back to model for final response
                response = chat.send_message(
                    Part.from_function_response(
                        name=fc.name,
                        response=tool_result
                    )
                )
    
    # Extract text response
    response_text = ""
    for part in response.candidates[0].content.parts:
        if hasattr(part, 'text') and part.text:
            response_text += part.text
    
    return ChatResponse(
        response=response_text,
        sql_query=sql_query,
        data=data,
        chart_config=chart_config,
        insights=insights
    )

# =====================================================
# API ENDPOINTS
# =====================================================
@app.get("/")
async def root():
    return {"message": "Costco Business Center Analytics API", "version": "1.0.0"}

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Chat endpoint for talk-to-data"""
    try:
        response = await chat_with_gemini(request.message, request.conversation_history)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/dashboard/metrics", response_model=DashboardMetrics)
async def get_dashboard_metrics():
    """Get key dashboard metrics"""
    try:
        # Revenue query
        revenue_query = f"""
        SELECT 
            SUM(amount) as total_revenue,
            AVG(amount) as avg_transaction
        FROM `{PROJECT_ID}.{DATASET_ID}.pos_sales`
        """
        revenue_result = execute_query(revenue_query)
        
        # Members count
        members_query = f"""
        SELECT COUNT(*) as total_members
        FROM `{PROJECT_ID}.{DATASET_ID}.members`
        WHERE is_active = TRUE
        """
        members_result = execute_query(members_query)
        
        # Conversion rate
        conversion_query = f"""
        SELECT 
            COUNTIF(status = 'Converted') / COUNT(*) as conversion_rate
        FROM `{PROJECT_ID}.{DATASET_ID}.leads`
        """
        conversion_result = execute_query(conversion_query)
        
        # Revenue by warehouse
        warehouse_query = f"""
        SELECT 
            CAST(warehouse_id AS STRING) as warehouse,
            SUM(amount) as revenue
        FROM `{PROJECT_ID}.{DATASET_ID}.pos_sales`
        GROUP BY warehouse_id
        """
        warehouse_result = execute_query(warehouse_query)
        
        # Revenue by industry
        industry_query = f"""
        SELECT 
            industry_code,
            SUM(amount) as revenue
        FROM `{PROJECT_ID}.{DATASET_ID}.pos_sales`
        GROUP BY industry_code
        """
        industry_result = execute_query(industry_query)
        
        # Lead funnel
        funnel_query = f"""
        SELECT 
            status,
            COUNT(*) as count
        FROM `{PROJECT_ID}.{DATASET_ID}.leads`
        GROUP BY status
        """
        funnel_result = execute_query(funnel_query)
        
        # Top marketers
        marketer_query = f"""
        SELECT 
            m.marketer_name,
            COUNT(DISTINCT l.lead_id) as leads,
            COUNTIF(l.status = 'Converted') as conversions,
            SUM(CASE WHEN l.status = 'Converted' THEN l.estimated_value ELSE 0 END) as influenced_revenue
        FROM `{PROJECT_ID}.{DATASET_ID}.marketers` m
        LEFT JOIN `{PROJECT_ID}.{DATASET_ID}.leads` l ON m.marketer_id = l.marketer_id
        GROUP BY m.marketer_name
        ORDER BY conversions DESC
        LIMIT 5
        """
        marketer_result = execute_query(marketer_query)
        
        return DashboardMetrics(
            total_revenue=revenue_result[0].get("total_revenue", 0) if revenue_result else 0,
            total_members=members_result[0].get("total_members", 0) if members_result else 0,
            conversion_rate=conversion_result[0].get("conversion_rate", 0) if conversion_result else 0,
            avg_transaction_value=revenue_result[0].get("avg_transaction", 0) if revenue_result else 0,
            revenue_by_warehouse={r["warehouse"]: r["revenue"] for r in warehouse_result},
            revenue_by_industry={r["industry_code"]: r["revenue"] for r in industry_result},
            lead_funnel={r["status"]: r["count"] for r in funnel_result},
            top_marketers=marketer_result
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/sales/trends")
async def get_sales_trends(
    warehouse_id: Optional[int] = None,
    industry_code: Optional[str] = None,
    period: Optional[str] = "monthly"
):
    """Get sales trends data"""
    filters = []
    if warehouse_id:
        filters.append(f"warehouse_id = {warehouse_id}")
    if industry_code:
        filters.append(f"industry_code = '{industry_code}'")
    
    where_clause = "WHERE " + " AND ".join(filters) if filters else ""
    
    if period == "daily":
        group_by = "sale_date"
    elif period == "weekly":
        group_by = "fiscal_year, fiscal_period, fiscal_week"
    else:
        group_by = "fiscal_year, fiscal_period"
    
    query = f"""
    SELECT 
        {group_by.replace(',', ' || \'-\' || ')  if ',' in group_by else group_by} as period,
        SUM(amount) as revenue,
        COUNT(DISTINCT member_id) as unique_members,
        SUM(transaction_count) as transactions
    FROM `{PROJECT_ID}.{DATASET_ID}.pos_sales`
    {where_clause}
    GROUP BY {group_by}
    ORDER BY 1
    """
    
    return execute_query(query)

@app.get("/leads/funnel")
async def get_lead_funnel(
    warehouse_id: Optional[int] = None,
    marketer_id: Optional[int] = None
):
    """Get lead funnel data"""
    filters = []
    if warehouse_id:
        filters.append(f"warehouse_id = {warehouse_id}")
    if marketer_id:
        filters.append(f"marketer_id = {marketer_id}")
    
    where_clause = "WHERE " + " AND ".join(filters) if filters else ""
    
    query = f"""
    SELECT 
        lead_source,
        COUNT(*) as total_leads,
        COUNTIF(status IN ('Contacted', 'Qualified', 'Proposal', 'Converted')) as contacted,
        COUNTIF(status IN ('Qualified', 'Proposal', 'Converted')) as qualified,
        COUNTIF(status IN ('Proposal', 'Converted')) as proposal_sent,
        COUNTIF(status = 'Converted') as converted,
        AVG(touch_point_count) as avg_touchpoints,
        AVG(CASE WHEN status = 'Converted' THEN conversion_days END) as avg_days_to_convert
    FROM `{PROJECT_ID}.{DATASET_ID}.leads`
    {where_clause}
    GROUP BY lead_source
    ORDER BY total_leads DESC
    """
    
    return execute_query(query)

@app.get("/forecast")
async def get_forecast(
    warehouse_id: Optional[int] = None,
    days: int = 30
):
    """Get sales forecast"""
    return execute_sales_forecast(warehouse_id, days)

@app.get("/leads/predictions")
async def get_lead_predictions(
    status: Optional[str] = "Qualified",
    warehouse_id: Optional[int] = None
):
    """Get lead conversion predictions"""
    return execute_lead_prediction(status, warehouse_id)

# =====================================================
# HEALTH CHECK
# =====================================================
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
