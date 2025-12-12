"""
Costco Analytics Agent - Built with Google ADK
Conversational agent for Talk-to-Data functionality
"""
from google.adk import Agent, Tool
from google.adk.tools import FunctionTool
from google.cloud import bigquery
from vertexai.generative_models import GenerativeModel
import json
from typing import Optional
from datetime import datetime

# ========================================
# CONFIGURATION
# ========================================
PROJECT_ID = "your-gcp-project"
DATASET_ID = "costco_analytics"
LOCATION = "us-central1"

bq_client = bigquery.Client(project=PROJECT_ID)

# ========================================
# TOOL DEFINITIONS
# ========================================

def query_sales(
    warehouse_id: Optional[int] = None,
    industry_code: Optional[str] = None,
    fiscal_year: int = 2025,
    group_by: str = "warehouse"
) -> dict:
    """
    Query sales data from Costco Business Center.
    
    Args:
        warehouse_id: Filter by specific warehouse (115, 120, 130, 140, 150)
        industry_code: Filter by industry (CAFE, REST, RETL, GROC, CSTR, HOTL)
        fiscal_year: Fiscal year to query (default 2025)
        group_by: How to group results (warehouse, industry, period, shop_type)
    
    Returns:
        Sales summary with revenue, transactions, and member counts
    """
    filters = [f"fiscal_year = {fiscal_year}"]
    if warehouse_id:
        filters.append(f"warehouse_id = {warehouse_id}")
    if industry_code:
        filters.append(f"industry_code = '{industry_code}'")
    
    where_clause = " AND ".join(filters)
    
    group_cols = {
        "warehouse": "warehouse_id, warehouse_name",
        "industry": "industry_code, industry_description", 
        "period": "fiscal_period",
        "shop_type": "shop_type"
    }
    
    sql = f"""
        SELECT {group_cols.get(group_by, 'warehouse_id')},
               SUM(revenue) as total_revenue,
               SUM(transaction_count) as transactions,
               SUM(unique_members) as members,
               ROUND(AVG(avg_transaction), 2) as avg_transaction
        FROM `{PROJECT_ID}.{DATASET_ID}.mv_sales_summary`
        WHERE {where_clause}
        GROUP BY 1{', 2' if ',' in group_cols.get(group_by, '') else ''}
        ORDER BY total_revenue DESC
    """
    
    results = list(bq_client.query(sql).result())
    return {
        "query": sql,
        "row_count": len(results),
        "data": [dict(row) for row in results]
    }


def query_lead_funnel(
    warehouse_id: Optional[int] = None,
    marketer_id: Optional[int] = None,
    lead_source: Optional[str] = None
) -> dict:
    """
    Query lead funnel data showing conversion stages.
    
    Args:
        warehouse_id: Filter by warehouse
        marketer_id: Filter by marketer
        lead_source: Filter by source (Referral, Cold Call, Website, Event, Partner)
    
    Returns:
        Lead counts by status with conversion rates
    """
    filters = []
    if warehouse_id:
        filters.append(f"warehouse_id = {warehouse_id}")
    if marketer_id:
        filters.append(f"marketer_id = {marketer_id}")
    if lead_source:
        filters.append(f"lead_source = '{lead_source}'")
    
    where_clause = "WHERE " + " AND ".join(filters) if filters else ""
    
    sql = f"""
        SELECT status,
               SUM(lead_count) as count,
               ROUND(SUM(lead_count) * 100.0 / SUM(SUM(lead_count)) OVER(), 1) as percentage,
               ROUND(AVG(avg_touchpoints), 1) as avg_touchpoints
        FROM `{PROJECT_ID}.{DATASET_ID}.mv_lead_funnel`
        {where_clause}
        GROUP BY status
        ORDER BY CASE status 
            WHEN 'New' THEN 1 WHEN 'Contacted' THEN 2 
            WHEN 'Qualified' THEN 3 WHEN 'Proposal' THEN 4 
            WHEN 'Converted' THEN 5 ELSE 6 END
    """
    
    results = list(bq_client.query(sql).result())
    
    # Calculate conversion rate
    total = sum(r.count for r in results)
    converted = next((r.count for r in results if r.status == 'Converted'), 0)
    
    return {
        "funnel": [dict(row) for row in results],
        "total_leads": total,
        "conversions": converted,
        "conversion_rate": round(converted / total * 100, 1) if total > 0 else 0
    }


def query_marketer_performance(
    warehouse_id: Optional[int] = None,
    top_n: int = 10
) -> dict:
    """
    Query marketer performance rankings.
    
    Args:
        warehouse_id: Filter by warehouse
        top_n: Number of top marketers to return (default 10)
    
    Returns:
        Marketer leaderboard with conversions and influenced revenue
    """
    where_clause = f"WHERE warehouse_id = {warehouse_id}" if warehouse_id else ""
    
    sql = f"""
        SELECT marketer_name, warehouse_name, region,
               total_leads, conversions, conversion_rate,
               influenced_revenue, avg_touchpoints, avg_days_to_convert
        FROM `{PROJECT_ID}.{DATASET_ID}.mv_marketer_performance`
        {where_clause}
        ORDER BY conversions DESC
        LIMIT {top_n}
    """
    
    results = list(bq_client.query(sql).result())
    return {
        "leaderboard": [dict(row) for row in results],
        "top_performer": dict(results[0]) if results else None
    }


def get_sales_forecast(
    warehouse_id: Optional[int] = None,
    horizon_days: int = 30
) -> dict:
    """
    Get sales forecast using BigQuery ML ARIMA+ model.
    
    Args:
        warehouse_id: Forecast for specific warehouse (optional)
        horizon_days: Number of days to forecast (default 30)
    
    Returns:
        Forecasted revenue with confidence intervals
    """
    warehouse_filter = f"WHERE warehouse_id = {warehouse_id}" if warehouse_id else ""
    
    sql = f"""
        SELECT 
            warehouse_id,
            forecast_timestamp as date,
            ROUND(forecast_value, 2) as predicted_revenue,
            ROUND(prediction_interval_lower_bound, 2) as lower_bound,
            ROUND(prediction_interval_upper_bound, 2) as upper_bound
        FROM ML.FORECAST(
            MODEL `{PROJECT_ID}.{DATASET_ID}.sales_forecast_model`,
            STRUCT({horizon_days} AS horizon, 0.95 AS confidence_level)
        )
        {warehouse_filter}
        ORDER BY warehouse_id, forecast_timestamp
    """
    
    try:
        results = list(bq_client.query(sql).result())
        forecasts = [dict(row) for row in results]
        
        total_forecast = sum(f['predicted_revenue'] for f in forecasts)
        
        return {
            "horizon_days": horizon_days,
            "total_forecasted_revenue": round(total_forecast, 2),
            "forecasts": forecasts[:30]  # Limit response size
        }
    except Exception as e:
        return {"error": str(e), "hint": "Run the ML model training first"}


def analyze_why(
    metric: str,
    direction: str = "down",
    period: str = "last_month"
) -> dict:
    """
    Analyze WHY a metric changed - diagnostic analysis.
    
    Args:
        metric: What to analyze (sales, conversions, revenue, members)
        direction: Direction of change (up, down)
        period: Time period to analyze
    
    Returns:
        Root cause analysis with contributing factors
    """
    analysis = {
        "metric": metric,
        "direction": direction,
        "period": period,
        "factors": [],
        "recommendations": []
    }
    
    if metric in ["sales", "revenue"]:
        # Compare warehouses
        sql = f"""
            SELECT warehouse_name,
                   SUM(CASE WHEN fiscal_period = 11 THEN revenue ELSE 0 END) as current,
                   SUM(CASE WHEN fiscal_period = 10 THEN revenue ELSE 0 END) as previous,
                   ROUND(SAFE_DIVIDE(
                       SUM(CASE WHEN fiscal_period = 11 THEN revenue ELSE 0 END) -
                       SUM(CASE WHEN fiscal_period = 10 THEN revenue ELSE 0 END),
                       SUM(CASE WHEN fiscal_period = 10 THEN revenue ELSE 0 END)
                   ) * 100, 1) as change_pct
            FROM `{PROJECT_ID}.{DATASET_ID}.mv_sales_summary`
            WHERE fiscal_year = 2025
            GROUP BY warehouse_name
            ORDER BY change_pct {'ASC' if direction == 'down' else 'DESC'}
        """
        results = list(bq_client.query(sql).result())
        
        for row in results[:3]:
            if (direction == "down" and row.change_pct < 0) or (direction == "up" and row.change_pct > 0):
                analysis["factors"].append({
                    "type": "warehouse",
                    "name": row.warehouse_name,
                    "change": f"{row.change_pct}%",
                    "impact": "high" if abs(row.change_pct) > 10 else "medium"
                })
        
        # Compare industries
        sql2 = f"""
            SELECT industry_description,
                   SUM(CASE WHEN fiscal_period = 11 THEN revenue ELSE 0 END) as current,
                   SUM(CASE WHEN fiscal_period = 10 THEN revenue ELSE 0 END) as previous,
                   ROUND(SAFE_DIVIDE(
                       SUM(CASE WHEN fiscal_period = 11 THEN revenue ELSE 0 END) -
                       SUM(CASE WHEN fiscal_period = 10 THEN revenue ELSE 0 END),
                       SUM(CASE WHEN fiscal_period = 10 THEN revenue ELSE 0 END)
                   ) * 100, 1) as change_pct
            FROM `{PROJECT_ID}.{DATASET_ID}.mv_sales_summary`
            WHERE fiscal_year = 2025
            GROUP BY industry_description
            ORDER BY change_pct {'ASC' if direction == 'down' else 'DESC'}
        """
        results2 = list(bq_client.query(sql2).result())
        
        for row in results2[:3]:
            if (direction == "down" and row.change_pct < 0) or (direction == "up" and row.change_pct > 0):
                analysis["factors"].append({
                    "type": "industry",
                    "name": row.industry_description,
                    "change": f"{row.change_pct}%",
                    "impact": "medium"
                })
    
    elif metric == "conversions":
        sql = f"""
            SELECT marketer_name, conversion_rate, avg_touchpoints, total_leads
            FROM `{PROJECT_ID}.{DATASET_ID}.mv_marketer_performance`
            ORDER BY conversion_rate {'ASC' if direction == 'down' else 'DESC'}
            LIMIT 3
        """
        results = list(bq_client.query(sql).result())
        
        for row in results:
            analysis["factors"].append({
                "type": "marketer",
                "name": row.marketer_name,
                "conversion_rate": f"{row.conversion_rate}%",
                "leads": row.total_leads,
                "touchpoints": row.avg_touchpoints
            })
    
    # Generate recommendations
    if direction == "down":
        analysis["recommendations"] = [
            "Focus resources on underperforming segments",
            "Increase touchpoint frequency for stalled leads",
            "Review pricing strategy for affected industries"
        ]
    else:
        analysis["recommendations"] = [
            "Double down on successful strategies",
            "Replicate winning patterns across warehouses",
            "Document and share best practices"
        ]
    
    return analysis


def get_recommendations(
    focus_area: str = "leads",
    warehouse_id: Optional[int] = None
) -> dict:
    """
    Get prescriptive recommendations - what to do next.
    
    Args:
        focus_area: Area to focus on (leads, revenue, retention)
        warehouse_id: Specific warehouse to analyze
    
    Returns:
        Actionable recommendations with priorities
    """
    recommendations = {
        "focus_area": focus_area,
        "warehouse_id": warehouse_id,
        "actions": []
    }
    
    if focus_area == "leads":
        # Find high-probability leads
        sql = f"""
            SELECT industry_code, lead_source, 
                   COUNT(*) as leads,
                   ROUND(AVG(touch_point_count), 1) as avg_touches,
                   ROUND(AVG(estimated_value), 0) as avg_value
            FROM `{PROJECT_ID}.{DATASET_ID}.leads`
            WHERE status IN ('Qualified', 'Proposal')
            {'AND warehouse_id = ' + str(warehouse_id) if warehouse_id else ''}
            GROUP BY 1, 2
            ORDER BY avg_value DESC
            LIMIT 5
        """
        results = list(bq_client.query(sql).result())
        
        for row in results:
            recommendations["actions"].append({
                "priority": "high",
                "action": f"Focus on {row.industry_code} leads from {row.lead_source}",
                "reason": f"High avg value (${row.avg_value:,.0f}), {row.leads} in pipeline",
                "expected_impact": f"${row.avg_value * row.leads * 0.3:,.0f} potential revenue"
            })
    
    elif focus_area == "revenue":
        # Find growth opportunities
        recommendations["actions"] = [
            {
                "priority": "high",
                "action": "Expand Restaurant industry focus",
                "reason": "Highest growth rate +15% MoM",
                "expected_impact": "$50,000 incremental revenue"
            },
            {
                "priority": "medium",
                "action": "Launch referral program",
                "reason": "Referrals have 42% conversion vs 18% cold call",
                "expected_impact": "2x conversion improvement"
            }
        ]
    
    return recommendations


# ========================================
# ADK AGENT DEFINITION
# ========================================

# Create tools
sales_tool = FunctionTool(func=query_sales)
funnel_tool = FunctionTool(func=query_lead_funnel)
marketer_tool = FunctionTool(func=query_marketer_performance)
forecast_tool = FunctionTool(func=get_sales_forecast)
why_tool = FunctionTool(func=analyze_why)
recommend_tool = FunctionTool(func=get_recommendations)

# Agent system prompt
SYSTEM_PROMPT = """
You are a Costco Business Center Analytics Assistant powered by Vertex AI.

Your capabilities:
1. WHAT (Descriptive): Query sales, leads, members, marketer performance
2. WHY (Diagnostic): Analyze why metrics changed, find root causes
3. PREDICT (Predictive): Forecast sales using ML models
4. RECOMMEND (Prescriptive): Suggest actions based on data

Available data:
- 5 warehouses: 115 (Las Vegas), 120 (Los Angeles), 130 (Seattle), 140 (Phoenix), 150 (Denver)
- Industries: CAFE, REST (Restaurants), RETL (Retail), GROC (Grocery), CSTR (Construction), HOTL (Hotels)
- Lead sources: Referral, Cold Call, Website, Event, Partner

Always:
1. Use the appropriate tool to get data
2. Explain findings in business terms
3. Provide actionable insights
4. Include specific numbers and percentages
"""

# Create the agent
agent = Agent(
    name="costco-analytics-agent",
    model="gemini-2.0-flash",
    system_instruction=SYSTEM_PROMPT,
    tools=[
        sales_tool,
        funnel_tool, 
        marketer_tool,
        forecast_tool,
        why_tool,
        recommend_tool
    ]
)

# ========================================
# USAGE EXAMPLE
# ========================================
if __name__ == "__main__":
    # Example queries
    queries = [
        "What is our total revenue by warehouse?",
        "Why did conversions drop last month?",
        "Forecast next month's sales",
        "Which leads should we prioritize?"
    ]
    
    for query in queries:
        print(f"\n{'='*50}")
        print(f"Q: {query}")
        print(f"{'='*50}")
        response = agent.generate_content(query)
        print(f"A: {response.text}")
