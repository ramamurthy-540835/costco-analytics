-- =====================================================
-- COSTCO BUSINESS CENTER - ANALYTICS DATA MODEL
-- BigQuery Schema Definition
-- =====================================================

-- Create Dataset
CREATE SCHEMA IF NOT EXISTS `costco_analytics`
OPTIONS(
  location="US",
  description="Costco Business Center Analytics Data"
);

-- =====================================================
-- 1. WAREHOUSES (Business Centers)
-- =====================================================
CREATE OR REPLACE TABLE `costco_analytics.warehouses` (
  warehouse_id INT64 NOT NULL,
  warehouse_name STRING,
  region STRING,
  city STRING,
  state STRING,
  opened_date DATE,
  manager_name STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

INSERT INTO `costco_analytics.warehouses` VALUES
(115, 'Business Center #115', 'West', 'Las Vegas', 'NV', '2018-03-15', 'Michael Chen', CURRENT_TIMESTAMP()),
(120, 'Business Center #120', 'West', 'Los Angeles', 'CA', '2015-06-22', 'Sarah Johnson', CURRENT_TIMESTAMP()),
(130, 'Business Center #130', 'Northwest', 'Seattle', 'WA', '2019-09-10', 'David Kim', CURRENT_TIMESTAMP()),
(140, 'Business Center #140', 'Southwest', 'Phoenix', 'AZ', '2020-01-08', 'Jessica Martinez', CURRENT_TIMESTAMP()),
(150, 'Business Center #150', 'Central', 'Denver', 'CO', '2017-11-30', 'Robert Wilson', CURRENT_TIMESTAMP());

-- =====================================================
-- 2. MARKETERS
-- =====================================================
CREATE OR REPLACE TABLE `costco_analytics.marketers` (
  marketer_id INT64 NOT NULL,
  marketer_name STRING,
  warehouse_id INT64,
  email STRING,
  phone STRING,
  hire_date DATE,
  is_active BOOL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

INSERT INTO `costco_analytics.marketers` VALUES
(1001, 'John Smith', 120, 'jsmith@costco.com', '310-555-0101', '2020-03-15', TRUE, CURRENT_TIMESTAMP()),
(1002, 'Emily Davis', 120, 'edavis@costco.com', '310-555-0102', '2021-06-01', TRUE, CURRENT_TIMESTAMP()),
(1003, 'Marcus Thompson', 115, 'mthompson@costco.com', '702-555-0103', '2019-08-20', TRUE, CURRENT_TIMESTAMP()),
(1004, 'Lisa Wang', 115, 'lwang@costco.com', '702-555-0104', '2022-01-10', TRUE, CURRENT_TIMESTAMP()),
(1005, 'Carlos Rodriguez', 130, 'crodriguez@costco.com', '206-555-0105', '2020-11-05', TRUE, CURRENT_TIMESTAMP()),
(1006, 'Amanda Foster', 130, 'afoster@costco.com', '206-555-0106', '2021-04-18', TRUE, CURRENT_TIMESTAMP()),
(1007, 'Kevin O''Brien', 140, 'kobrien@costco.com', '602-555-0107', '2021-09-22', TRUE, CURRENT_TIMESTAMP()),
(1008, 'Rachel Green', 150, 'rgreen@costco.com', '303-555-0108', '2020-02-28', TRUE, CURRENT_TIMESTAMP());

-- =====================================================
-- 3. INDUSTRIES
-- =====================================================
CREATE OR REPLACE TABLE `costco_analytics.industries` (
  industry_code STRING NOT NULL,
  industry_description STRING,
  category STRING,
  avg_order_value FLOAT64,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

INSERT INTO `costco_analytics.industries` VALUES
('CAFE', 'Cafes & Bakeries', 'Food Service', 285.50, CURRENT_TIMESTAMP()),
('REST', 'Restaurants', 'Food Service', 425.75, CURRENT_TIMESTAMP()),
('RETL', 'Retailers', 'Retail', 312.25, CURRENT_TIMESTAMP()),
('GROC', 'Grocery Stores', 'Retail', 567.80, CURRENT_TIMESTAMP()),
('CSTR', 'Construction', 'Industrial', 892.45, CURRENT_TIMESTAMP()),
('HOTL', 'Hotels & Lodging', 'Hospitality', 756.30, CURRENT_TIMESTAMP()),
('OFFC', 'Office & Corporate', 'Corporate', 445.60, CURRENT_TIMESTAMP()),
('HLTH', 'Healthcare', 'Healthcare', 623.15, CURRENT_TIMESTAMP());

-- =====================================================
-- 4. LEADS
-- =====================================================
CREATE OR REPLACE TABLE `costco_analytics.leads` (
  lead_id INT64 NOT NULL,
  warehouse_id INT64,
  marketer_id INT64,
  industry_code STRING,
  lead_source STRING,  -- 'Referral', 'Cold Call', 'Website', 'Event', 'Partner'
  business_name STRING,
  contact_name STRING,
  contact_email STRING,
  contact_phone STRING,
  city STRING,
  state STRING,
  estimated_value FLOAT64,
  touch_point_count INT64 DEFAULT 0,
  status STRING,  -- 'New', 'Contacted', 'Qualified', 'Proposal', 'Converted', 'Lost'
  created_at TIMESTAMP,
  first_contact_at TIMESTAMP,
  qualified_at TIMESTAMP,
  converted_at TIMESTAMP,
  conversion_days INT64,  -- Days from lead creation to conversion
  created_date DATE
);

-- =====================================================
-- 5. MEMBERS
-- =====================================================
CREATE OR REPLACE TABLE `costco_analytics.members` (
  member_id INT64 NOT NULL,
  member_number STRING,
  warehouse_id INT64,
  industry_code STRING,
  membership_type STRING,  -- 'Business', 'Business Executive', 'Gold Star Business'
  business_name STRING,
  contact_first_name STRING,
  contact_last_name STRING,
  email STRING,
  phone STRING,
  address STRING,
  city STRING,
  state STRING,
  zip_code STRING,
  lead_id INT64,  -- Source lead if applicable
  marketer_id INT64,  -- Marketer who converted
  joined_at TIMESTAMP,
  membership_renewal_date DATE,
  lifetime_value FLOAT64 DEFAULT 0,
  is_active BOOL DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- =====================================================
-- 6. POS_SALES (Point of Sale Transactions)
-- =====================================================
CREATE OR REPLACE TABLE `costco_analytics.pos_sales` (
  sale_id INT64 NOT NULL,
  warehouse_id INT64,
  member_id INT64,
  fiscal_year INT64,
  fiscal_period INT64,
  fiscal_week INT64,
  sale_date DATE,
  transaction_count INT64,
  amount FLOAT64,
  shop_type STRING,  -- 'Walk-in', 'Online', 'Phone Order'
  industry_code STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- =====================================================
-- 7. LEAD_TOUCHPOINTS (Interaction History)
-- =====================================================
CREATE OR REPLACE TABLE `costco_analytics.lead_touchpoints` (
  touchpoint_id INT64 NOT NULL,
  lead_id INT64,
  marketer_id INT64,
  touchpoint_type STRING,  -- 'Call', 'Email', 'Meeting', 'Demo', 'Proposal'
  touchpoint_date TIMESTAMP,
  notes STRING,
  outcome STRING,  -- 'Positive', 'Neutral', 'Negative', 'No Response'
  next_action STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- =====================================================
-- BIGQUERY ML MODELS
-- =====================================================

-- 1. SALES FORECASTING MODEL (ARIMA+)
CREATE OR REPLACE MODEL `costco_analytics.sales_forecast_model`
OPTIONS(
  model_type='ARIMA_PLUS',
  time_series_timestamp_col='sale_date',
  time_series_data_col='daily_revenue',
  time_series_id_col='warehouse_id',
  auto_arima=TRUE,
  horizon=30,
  confidence_level=0.95
) AS
SELECT 
  warehouse_id,
  sale_date,
  SUM(amount) as daily_revenue
FROM `costco_analytics.pos_sales`
GROUP BY warehouse_id, sale_date;

-- 2. LEAD CONVERSION PREDICTION MODEL
CREATE OR REPLACE MODEL `costco_analytics.lead_conversion_model`
OPTIONS(
  model_type='LOGISTIC_REG',
  input_label_cols=['is_converted'],
  auto_class_weights=TRUE,
  l2_reg=0.1
) AS
SELECT 
  industry_code,
  lead_source,
  warehouse_id,
  marketer_id,
  touch_point_count,
  estimated_value,
  TIMESTAMP_DIFF(COALESCE(converted_at, CURRENT_TIMESTAMP()), created_at, DAY) as days_open,
  IF(status = 'Converted', 1, 0) as is_converted
FROM `costco_analytics.leads`
WHERE status IN ('Converted', 'Lost');

-- 3. MEMBER SEGMENTATION MODEL (Clustering)
CREATE OR REPLACE MODEL `costco_analytics.member_segments_model`
OPTIONS(
  model_type='KMEANS',
  num_clusters=5,
  standardize_features=TRUE
) AS
SELECT 
  member_id,
  lifetime_value,
  COUNT(DISTINCT s.sale_id) as total_transactions,
  AVG(s.amount) as avg_transaction_value,
  TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), MAX(s.created_at), DAY) as days_since_last_purchase
FROM `costco_analytics.members` m
LEFT JOIN `costco_analytics.pos_sales` s ON m.member_id = s.member_id
GROUP BY member_id, lifetime_value;

-- =====================================================
-- ANALYTICS VIEWS
-- =====================================================

-- Lead Funnel Summary
CREATE OR REPLACE VIEW `costco_analytics.v_lead_funnel` AS
SELECT
  warehouse_id,
  marketer_id,
  industry_code,
  lead_source,
  COUNT(*) as total_leads,
  COUNTIF(status IN ('Contacted', 'Qualified', 'Proposal', 'Converted')) as contacted,
  COUNTIF(status IN ('Qualified', 'Proposal', 'Converted')) as qualified,
  COUNTIF(status IN ('Proposal', 'Converted')) as proposal_sent,
  COUNTIF(status = 'Converted') as converted,
  SAFE_DIVIDE(COUNTIF(status = 'Converted'), COUNT(*)) as conversion_rate,
  AVG(touch_point_count) as avg_touchpoints,
  AVG(CASE WHEN status = 'Converted' THEN conversion_days END) as avg_days_to_convert
FROM `costco_analytics.leads`
GROUP BY warehouse_id, marketer_id, industry_code, lead_source;

-- Sales Performance Summary
CREATE OR REPLACE VIEW `costco_analytics.v_sales_performance` AS
SELECT
  s.warehouse_id,
  w.warehouse_name,
  s.fiscal_year,
  s.fiscal_period,
  s.industry_code,
  i.industry_description,
  s.shop_type,
  COUNT(DISTINCT s.member_id) as unique_members,
  SUM(s.transaction_count) as total_transactions,
  SUM(s.amount) as total_revenue,
  AVG(s.amount) as avg_transaction_value
FROM `costco_analytics.pos_sales` s
LEFT JOIN `costco_analytics.warehouses` w ON s.warehouse_id = w.warehouse_id
LEFT JOIN `costco_analytics.industries` i ON s.industry_code = i.industry_code
GROUP BY s.warehouse_id, w.warehouse_name, s.fiscal_year, s.fiscal_period, 
         s.industry_code, i.industry_description, s.shop_type;

-- Marketer Performance
CREATE OR REPLACE VIEW `costco_analytics.v_marketer_performance` AS
SELECT
  m.marketer_id,
  m.marketer_name,
  m.warehouse_id,
  w.warehouse_name,
  COUNT(DISTINCT l.lead_id) as total_leads,
  COUNTIF(l.status = 'Converted') as conversions,
  SAFE_DIVIDE(COUNTIF(l.status = 'Converted'), COUNT(DISTINCT l.lead_id)) as conversion_rate,
  SUM(CASE WHEN l.status = 'Converted' THEN l.estimated_value ELSE 0 END) as influenced_revenue,
  AVG(l.touch_point_count) as avg_touchpoints
FROM `costco_analytics.marketers` m
LEFT JOIN `costco_analytics.leads` l ON m.marketer_id = l.marketer_id
LEFT JOIN `costco_analytics.warehouses` w ON m.warehouse_id = w.warehouse_id
GROUP BY m.marketer_id, m.marketer_name, m.warehouse_id, w.warehouse_name;
