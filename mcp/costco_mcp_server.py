"""
Costco Analytics MCP Server
Connects Claude Desktop / Power BI to BigQuery via Model Context Protocol
"""
import json
import asyncio
from typing import Any
from datetime import datetime
from google.cloud import bigquery
from mcp.server import Server
from mcp.types import Tool, TextContent, Resource
from mcp.server.stdio import stdio_server

# ========================================
# CONFIGURATION
# ========================================
PROJECT_ID = "your-gcp-project"
DATASET_ID = "costco_analytics"

# Initialize
server = Server("costco-analytics-mcp")
bq_client = bigquery.Client(project=PROJECT_ID)

# ========================================
# SEMANTIC LAYER - Data Definitions
# ========================================
SEMANTIC_MODEL = {
    "entities": {
        "leads": {
            "description": "Business leads tracked by marketers",
            "measures": ["count", "conversion_rate", "avg_touchpoints", "total_value"],
            "dimensions": ["status", "source", "industry", "warehouse", "marketer", "period"]
        },
        "members": {
            "description": "Converted members with active memberships",
            "measures": ["count", "lifetime_value", "avg_transaction"],
            "dimensions": ["membership_type", "industry", "warehouse", "join_period"]
        },
        "sales": {
            "description": "Point of sale transactions",
            "measures": ["revenue", "transactions", "avg_basket", "unique_members"],
            "dimensions": ["warehouse", "industry", "shop_type", "fiscal_year", "fiscal_period"]
        },
        "marketers": {
            "description": "Sales team members",
            "measures": ["leads_count", "conversions", "conversion_rate", "influenced_revenue"],
            "dimensions": ["name", "warehouse", "region"]
        }
    },
    "relationships": [
        {"from": "leads", "to": "members", "via": "lead_id"},
        {"from": "leads", "to": "marketers", "via": "marketer_id"},
        {"from": "members", "to": "sales", "via": "member_id"},
        {"from": "all", "to": "warehouses", "via": "warehouse_id"}
    ]
}

# ========================================
# SQL TEMPLATES FOR COMMON QUERIES
# ========================================
SQL_TEMPLATES = {
    "revenue_by_warehouse": """
        SELECT warehouse_id, SUM(amount) as revenue, COUNT(*) as transactions
        FROM `{project}.{dataset}.mv_sales_summary`
        WHERE fiscal_year = @year
        GROUP BY warehouse_id ORDER BY revenue DESC
    """,
    "lead_funnel": """
        SELECT status, COUNT(*) as count, 
               ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
        FROM `{project}.{dataset}.mv_lead_funnel`
        GROUP BY status
        ORDER BY CASE status 
            WHEN 'New' THEN 1 WHEN 'Contacted' THEN 2 
            WHEN 'Qualified' THEN 3 WHEN 'Proposal' THEN 4 
            WHEN 'Converted' THEN 5 ELSE 6 END
    """,
    "marketer_performance": """
        SELECT * FROM `{project}.{dataset}.mv_marketer_performance`
        ORDER BY conversions DESC LIMIT 10
    """,
    "conversion_trend": """
        SELECT fiscal_period, conversion_rate, total_leads, conversions
        FROM `{project}.{dataset}.mv_conversion_trend`
        WHERE fiscal_year = @year ORDER BY fiscal_period
    """,
    "industry_revenue": """
        SELECT industry_code, SUM(revenue) as revenue, COUNT(DISTINCT member_id) as members
        FROM `{project}.{dataset}.mv_industry_summary`
        GROUP BY industry_code ORDER BY revenue DESC
    """
}

# ========================================
# MCP TOOLS
# ========================================
@server.list_tools()
async def list_tools() -> list[Tool]:
    return [
        Tool(
            name="query_analytics",
            description="Query Costco Business Center analytics data. Supports: revenue, leads, conversions, marketers, members, sales trends.",
            inputSchema={
                "type": "object",
                "properties": {
                    "query_type": {
                        "type": "string",
                        "enum": ["revenue_by_warehouse", "lead_funnel", "marketer_performance", 
                                 "conversion_trend", "industry_revenue", "custom"],
                        "description": "Pre-built query type or 'custom' for SQL"
                    },
                    "custom_sql": {
                        "type": "string",
                        "description": "Custom SQL query (only if query_type='custom')"
                    },
                    "parameters": {
                        "type": "object",
                        "description": "Query parameters like year, warehouse_id, etc."
                    }
                },
                "required": ["query_type"]
            }
        ),
        Tool(
            name="get_insights",
            description="Get AI-generated insights about the data. Analyzes trends, anomalies, and provides recommendations.",
            inputSchema={
                "type": "object",
                "properties": {
                    "topic": {
                        "type": "string",
                        "enum": ["sales", "conversions", "marketers", "forecasts", "anomalies"],
                        "description": "Topic to analyze"
                    },
                    "warehouse_id": {"type": "integer", "description": "Filter by warehouse"},
                    "period": {"type": "string", "description": "Time period (e.g., 'last_month', 'ytd')"}
                },
                "required": ["topic"]
            }
        ),
        Tool(
            name="get_forecast",
            description="Get sales forecast using BigQuery ML ARIMA+ model",
            inputSchema={
                "type": "object",
                "properties": {
                    "warehouse_id": {"type": "integer"},
                    "horizon_days": {"type": "integer", "default": 30}
                }
            }
        ),
        Tool(
            name="get_semantic_model",
            description="Get the semantic data model - entities, measures, dimensions, relationships",
            inputSchema={"type": "object", "properties": {}}
        )
    ]

@server.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    try:
        if name == "query_analytics":
            result = await execute_query(arguments)
        elif name == "get_insights":
            result = await generate_insights(arguments)
        elif name == "get_forecast":
            result = await get_forecast(arguments)
        elif name == "get_semantic_model":
            result = json.dumps(SEMANTIC_MODEL, indent=2)
        else:
            result = f"Unknown tool: {name}"
        
        return [TextContent(type="text", text=str(result))]
    except Exception as e:
        return [TextContent(type="text", text=f"Error: {str(e)}")]

async def execute_query(args: dict) -> str:
    query_type = args.get("query_type")
    params = args.get("parameters", {})
    
    if query_type == "custom":
        sql = args.get("custom_sql", "")
    else:
        sql = SQL_TEMPLATES.get(query_type, "").format(
            project=PROJECT_ID, dataset=DATASET_ID
        )
    
    if not sql:
        return "Invalid query type"
    
    # Execute query
    job_config = bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter(k, "STRING" if isinstance(v, str) else "INT64", v)
            for k, v in params.items()
        ]
    )
    
    query_job = bq_client.query(sql, job_config=job_config)
    results = query_job.result()
    
    # Format results
    rows = [dict(row) for row in results]
    return json.dumps({"sql": sql, "row_count": len(rows), "data": rows[:100]}, indent=2, default=str)

async def generate_insights(args: dict) -> str:
    topic = args.get("topic")
    warehouse = args.get("warehouse_id")
    
    insights = {
        "topic": topic,
        "generated_at": datetime.now().isoformat(),
        "insights": []
    }
    
    if topic == "sales":
        # Get sales data
        sql = f"""
            SELECT fiscal_period, SUM(amount) as revenue,
                   LAG(SUM(amount)) OVER (ORDER BY fiscal_period) as prev_revenue
            FROM `{PROJECT_ID}.{DATASET_ID}.pos_sales`
            WHERE fiscal_year = 2025
            GROUP BY fiscal_period ORDER BY fiscal_period
        """
        results = list(bq_client.query(sql).result())
        
        for row in results[-3:]:
            if row.prev_revenue and row.prev_revenue > 0:
                change = ((row.revenue - row.prev_revenue) / row.prev_revenue) * 100
                insights["insights"].append({
                    "period": row.fiscal_period,
                    "revenue": float(row.revenue),
                    "change_pct": round(change, 1),
                    "trend": "up" if change > 0 else "down"
                })
    
    elif topic == "conversions":
        sql = f"""
            SELECT 
                COUNTIF(status = 'Converted') as conversions,
                COUNT(*) as total,
                ROUND(COUNTIF(status = 'Converted') * 100.0 / COUNT(*), 2) as rate
            FROM `{PROJECT_ID}.{DATASET_ID}.leads`
        """
        row = list(bq_client.query(sql).result())[0]
        insights["insights"].append({
            "total_leads": row.total,
            "conversions": row.conversions,
            "conversion_rate": float(row.rate),
            "benchmark": 25.0,
            "vs_benchmark": "above" if row.rate > 25 else "below"
        })
    
    return json.dumps(insights, indent=2)

async def get_forecast(args: dict) -> str:
    warehouse_id = args.get("warehouse_id")
    horizon = args.get("horizon_days", 30)
    
    warehouse_filter = f"WHERE warehouse_id = {warehouse_id}" if warehouse_id else ""
    
    sql = f"""
        SELECT 
            forecast_timestamp,
            forecast_value,
            prediction_interval_lower_bound as lower,
            prediction_interval_upper_bound as upper
        FROM ML.FORECAST(
            MODEL `{PROJECT_ID}.{DATASET_ID}.sales_forecast_model`,
            STRUCT({horizon} AS horizon, 0.95 AS confidence_level)
        )
        {warehouse_filter}
        ORDER BY forecast_timestamp
        LIMIT 30
    """
    
    try:
        results = list(bq_client.query(sql).result())
        forecasts = [
            {
                "date": row.forecast_timestamp.isoformat(),
                "predicted": round(row.forecast_value, 2),
                "lower": round(row.lower, 2),
                "upper": round(row.upper, 2)
            }
            for row in results
        ]
        return json.dumps({"horizon_days": horizon, "forecasts": forecasts}, indent=2)
    except Exception as e:
        return json.dumps({"error": str(e), "hint": "ML model may need training first"})

# ========================================
# MCP RESOURCES (for Power BI semantic layer)
# ========================================
@server.list_resources()
async def list_resources() -> list[Resource]:
    return [
        Resource(
            uri="costco://semantic-model",
            name="Costco Semantic Model",
            description="Complete semantic data model for Power BI",
            mimeType="application/json"
        ),
        Resource(
            uri="costco://kpis",
            name="KPI Definitions",
            description="Business KPI calculations and thresholds",
            mimeType="application/json"
        )
    ]

@server.read_resource()
async def read_resource(uri: str) -> str:
    if uri == "costco://semantic-model":
        return json.dumps(SEMANTIC_MODEL, indent=2)
    elif uri == "costco://kpis":
        kpis = {
            "conversion_rate": {"formula": "conversions / total_leads * 100", "target": 28, "unit": "%"},
            "avg_deal_value": {"formula": "total_revenue / conversions", "target": 5000, "unit": "$"},
            "customer_lifetime_value": {"formula": "avg_transaction * frequency * lifespan", "target": 15000, "unit": "$"},
            "lead_velocity": {"formula": "new_leads_this_month / new_leads_last_month", "target": 1.1, "unit": "ratio"}
        }
        return json.dumps(kpis, indent=2)
    return "{}"

# ========================================
# MAIN
# ========================================
async def main():
    async with stdio_server() as (read_stream, write_stream):
        await server.run(read_stream, write_stream, server.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())
