-- =====================================================
-- COSTCO ANALYTICS - MATERIALIZED VIEWS FOR POWER BI
-- Optimized for semantic layer + fast refresh
-- =====================================================

-- 1. SALES SUMMARY (Main Power BI fact table)
CREATE MATERIALIZED VIEW IF NOT EXISTS `costco_analytics.mv_sales_summary`
OPTIONS (
  enable_refresh = true,
  refresh_interval_minutes = 60,
  max_staleness = INTERVAL "4" HOUR
) AS
SELECT 
  s.warehouse_id,
  w.warehouse_name,
  w.region,
  s.fiscal_year,
  s.fiscal_period,
  s.industry_code,
  i.industry_description,
  s.shop_type,
  COUNT(DISTINCT s.sale_id) as transaction_count,
  COUNT(DISTINCT s.member_id) as unique_members,
  SUM(s.amount) as revenue,
  AVG(s.amount) as avg_transaction,
  SUM(s.transaction_count) as item_count
FROM `costco_analytics.pos_sales` s
LEFT JOIN `costco_analytics.warehouses` w ON s.warehouse_id = w.warehouse_id
LEFT JOIN `costco_analytics.industries` i ON s.industry_code = i.industry_code
GROUP BY 1,2,3,4,5,6,7,8;

-- 2. LEAD FUNNEL (For conversion analysis)
CREATE MATERIALIZED VIEW IF NOT EXISTS `costco_analytics.mv_lead_funnel`
OPTIONS (
  enable_refresh = true,
  refresh_interval_minutes = 30
) AS
SELECT 
  l.warehouse_id,
  w.warehouse_name,
  l.marketer_id,
  m.marketer_name,
  l.industry_code,
  l.lead_source,
  l.status,
  EXTRACT(YEAR FROM l.created_at) as lead_year,
  EXTRACT(MONTH FROM l.created_at) as lead_month,
  COUNT(*) as lead_count,
  AVG(l.touch_point_count) as avg_touchpoints,
  AVG(l.estimated_value) as avg_estimated_value,
  AVG(CASE WHEN l.status = 'Converted' THEN l.conversion_days END) as avg_days_to_convert
FROM `costco_analytics.leads` l
LEFT JOIN `costco_analytics.warehouses` w ON l.warehouse_id = w.warehouse_id
LEFT JOIN `costco_analytics.marketers` m ON l.marketer_id = m.marketer_id
GROUP BY 1,2,3,4,5,6,7,8,9;

-- 3. MARKETER PERFORMANCE (Leaderboard)
CREATE MATERIALIZED VIEW IF NOT EXISTS `costco_analytics.mv_marketer_performance`
OPTIONS (
  enable_refresh = true,
  refresh_interval_minutes = 60
) AS
SELECT 
  m.marketer_id,
  m.marketer_name,
  m.warehouse_id,
  w.warehouse_name,
  w.region,
  COUNT(DISTINCT l.lead_id) as total_leads,
  COUNTIF(l.status = 'Converted') as conversions,
  COUNTIF(l.status = 'Lost') as lost,
  ROUND(SAFE_DIVIDE(COUNTIF(l.status = 'Converted'), COUNT(DISTINCT l.lead_id)) * 100, 2) as conversion_rate,
  SUM(CASE WHEN l.status = 'Converted' THEN l.estimated_value ELSE 0 END) as influenced_revenue,
  AVG(l.touch_point_count) as avg_touchpoints,
  AVG(CASE WHEN l.status = 'Converted' THEN l.conversion_days END) as avg_days_to_convert
FROM `costco_analytics.marketers` m
LEFT JOIN `costco_analytics.leads` l ON m.marketer_id = l.marketer_id
LEFT JOIN `costco_analytics.warehouses` w ON m.warehouse_id = w.warehouse_id
WHERE m.is_active = TRUE
GROUP BY 1,2,3,4,5;

-- 4. CONVERSION TREND (Time series for forecasting)
CREATE MATERIALIZED VIEW IF NOT EXISTS `costco_analytics.mv_conversion_trend`
OPTIONS (
  enable_refresh = true,
  refresh_interval_minutes = 60
) AS
SELECT 
  EXTRACT(YEAR FROM created_at) as fiscal_year,
  EXTRACT(MONTH FROM created_at) as fiscal_period,
  warehouse_id,
  industry_code,
  COUNT(*) as total_leads,
  COUNTIF(status = 'Converted') as conversions,
  ROUND(SAFE_DIVIDE(COUNTIF(status = 'Converted'), COUNT(*)) * 100, 2) as conversion_rate,
  SUM(CASE WHEN status = 'Converted' THEN estimated_value ELSE 0 END) as converted_value
FROM `costco_analytics.leads`
GROUP BY 1,2,3,4;

-- 5. INDUSTRY SUMMARY (Revenue by industry)
CREATE MATERIALIZED VIEW IF NOT EXISTS `costco_analytics.mv_industry_summary`
OPTIONS (
  enable_refresh = true,
  refresh_interval_minutes = 60
) AS
SELECT 
  s.industry_code,
  i.industry_description,
  i.category,
  s.warehouse_id,
  w.warehouse_name,
  s.fiscal_year,
  s.fiscal_period,
  COUNT(DISTINCT s.member_id) as member_count,
  SUM(s.amount) as revenue,
  AVG(s.amount) as avg_transaction,
  COUNT(DISTINCT s.sale_id) as transaction_count
FROM `costco_analytics.pos_sales` s
LEFT JOIN `costco_analytics.industries` i ON s.industry_code = i.industry_code
LEFT JOIN `costco_analytics.warehouses` w ON s.warehouse_id = w.warehouse_id
GROUP BY 1,2,3,4,5,6,7;

-- 6. MEMBER LIFETIME VALUE
CREATE MATERIALIZED VIEW IF NOT EXISTS `costco_analytics.mv_member_ltv`
OPTIONS (
  enable_refresh = true,
  refresh_interval_minutes = 120
) AS
SELECT 
  m.member_id,
  m.warehouse_id,
  m.industry_code,
  m.membership_type,
  m.lifetime_value,
  COUNT(DISTINCT s.sale_id) as total_transactions,
  SUM(s.amount) as total_spend,
  AVG(s.amount) as avg_transaction,
  MIN(s.sale_date) as first_purchase,
  MAX(s.sale_date) as last_purchase,
  DATE_DIFF(MAX(s.sale_date), MIN(s.sale_date), DAY) as customer_tenure_days,
  COUNT(DISTINCT s.fiscal_period) as active_periods
FROM `costco_analytics.members` m
LEFT JOIN `costco_analytics.pos_sales` s ON m.member_id = s.member_id
WHERE m.is_active = TRUE
GROUP BY 1,2,3,4,5;

-- 7. DAILY SALES (For ARIMA forecasting)
CREATE MATERIALIZED VIEW IF NOT EXISTS `costco_analytics.mv_daily_sales`
OPTIONS (
  enable_refresh = true,
  refresh_interval_minutes = 60
) AS
SELECT 
  sale_date,
  warehouse_id,
  SUM(amount) as daily_revenue,
  COUNT(DISTINCT member_id) as unique_customers,
  COUNT(*) as transaction_count,
  AVG(amount) as avg_transaction
FROM `costco_analytics.pos_sales`
GROUP BY 1, 2;

-- 8. TOUCHPOINT EFFECTIVENESS
CREATE MATERIALIZED VIEW IF NOT EXISTS `costco_analytics.mv_touchpoint_analysis`
OPTIONS (
  enable_refresh = true,
  refresh_interval_minutes = 120
) AS
SELECT 
  t.touchpoint_type,
  t.outcome,
  l.industry_code,
  l.lead_source,
  COUNT(*) as touchpoint_count,
  COUNT(DISTINCT t.lead_id) as leads_touched,
  COUNTIF(l.status = 'Converted') as resulted_in_conversion,
  ROUND(SAFE_DIVIDE(COUNTIF(l.status = 'Converted'), COUNT(DISTINCT t.lead_id)) * 100, 2) as conversion_rate
FROM `costco_analytics.lead_touchpoints` t
LEFT JOIN `costco_analytics.leads` l ON t.lead_id = l.lead_id
GROUP BY 1,2,3,4;

-- =====================================================
-- SEMANTIC LAYER VIEWS (For Power BI DirectQuery)
-- =====================================================

-- KPI Summary View
CREATE OR REPLACE VIEW `costco_analytics.v_kpi_summary` AS
SELECT 
  'Total Revenue' as kpi_name,
  CAST(SUM(revenue) AS STRING) as kpi_value,
  '$' as unit,
  'revenue' as category
FROM `costco_analytics.mv_sales_summary`
WHERE fiscal_year = EXTRACT(YEAR FROM CURRENT_DATE())
UNION ALL
SELECT 
  'Active Members',
  CAST(COUNT(DISTINCT member_id) AS STRING),
  '',
  'members'
FROM `costco_analytics.mv_member_ltv`
UNION ALL
SELECT 
  'Conversion Rate',
  CAST(ROUND(SAFE_DIVIDE(SUM(conversions), SUM(total_leads)) * 100, 1) AS STRING),
  '%',
  'leads'
FROM `costco_analytics.mv_conversion_trend`
WHERE fiscal_year = EXTRACT(YEAR FROM CURRENT_DATE())
UNION ALL
SELECT 
  'Avg Transaction',
  CAST(ROUND(AVG(avg_transaction), 0) AS STRING),
  '$',
  'sales'
FROM `costco_analytics.mv_sales_summary`
WHERE fiscal_year = EXTRACT(YEAR FROM CURRENT_DATE());

-- Power BI Relationship View
CREATE OR REPLACE VIEW `costco_analytics.v_powerbi_model` AS
SELECT 
  w.warehouse_id,
  w.warehouse_name,
  w.region,
  i.industry_code,
  i.industry_description,
  i.category as industry_category,
  m.marketer_id,
  m.marketer_name,
  ss.fiscal_year,
  ss.fiscal_period,
  ss.shop_type,
  ss.revenue,
  ss.transaction_count,
  ss.unique_members,
  ss.avg_transaction,
  mp.conversion_rate as marketer_conversion_rate,
  mp.influenced_revenue as marketer_influenced_revenue
FROM `costco_analytics.mv_sales_summary` ss
LEFT JOIN `costco_analytics.warehouses` w ON ss.warehouse_id = w.warehouse_id
LEFT JOIN `costco_analytics.industries` i ON ss.industry_code = i.industry_code
LEFT JOIN `costco_analytics.mv_marketer_performance` mp ON ss.warehouse_id = mp.warehouse_id;
