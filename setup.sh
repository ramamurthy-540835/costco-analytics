#!/bin/bash
# =====================================================
# COSTCO ANALYTICS - QUICK SETUP
# =====================================================

set -e

echo "======================================"
echo "Costco Analytics Platform Setup"
echo "======================================"

# Check prerequisites
command -v gcloud >/dev/null 2>&1 || { echo "gcloud CLI required. Install: https://cloud.google.com/sdk"; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "Python 3.10+ required"; exit 1; }

# Configuration
read -p "Enter GCP Project ID: " PROJECT_ID
read -p "Enter Region (default us-central1): " REGION
REGION=${REGION:-us-central1}

export PROJECT_ID
export REGION
export DATASET_ID="costco_analytics"

echo ""
echo "📦 Step 1: Enable GCP APIs..."
gcloud services enable \
  bigquery.googleapis.com \
  aiplatform.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  --project=$PROJECT_ID

echo ""
echo "📊 Step 2: Create BigQuery Dataset..."
bq mk --location=US --dataset ${PROJECT_ID}:${DATASET_ID} 2>/dev/null || echo "Dataset exists"

echo ""
echo "📋 Step 3: Create Schema..."
bq query --use_legacy_sql=false --project_id=$PROJECT_ID < sql/01_schema.sql

echo ""
echo "🔄 Step 4: Generate Sample Data..."
cd data && python3 generate_sample_data.py && cd ..

echo ""
echo "📤 Step 5: Load Data to BigQuery..."
for table in leads members pos_sales touchpoints; do
  bq load --source_format=NEWLINE_DELIMITED_JSON \
    ${PROJECT_ID}:${DATASET_ID}.${table} \
    data/${table}.json
done

echo ""
echo "📈 Step 6: Create Materialized Views..."
bq query --use_legacy_sql=false --project_id=$PROJECT_ID < sql/02_materialized_views.sql

echo ""
echo "🧠 Step 7: Train ML Models..."
bq query --use_legacy_sql=false --project_id=$PROJECT_ID <<EOF
CREATE OR REPLACE MODEL \`${PROJECT_ID}.${DATASET_ID}.sales_forecast_model\`
OPTIONS(
  model_type='ARIMA_PLUS',
  time_series_timestamp_col='sale_date',
  time_series_data_col='daily_revenue',
  time_series_id_col='warehouse_id',
  auto_arima=TRUE,
  horizon=30
) AS
SELECT warehouse_id, sale_date, SUM(amount) as daily_revenue
FROM \`${PROJECT_ID}.${DATASET_ID}.pos_sales\`
GROUP BY 1, 2;
EOF

echo ""
echo "🐍 Step 8: Install Python Dependencies..."
pip install -r requirements.txt

echo ""
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "Next Steps:"
echo "1. Start MCP Server:  python mcp/costco_mcp_server.py"
echo "2. Start API:         cd backend && uvicorn main:app --reload"
echo "3. Start Frontend:    cd frontend && npm install && npm run dev"
echo ""
echo "For Claude Desktop, add to config:"
echo "  ~/Library/Application Support/Claude/claude_desktop_config.json (Mac)"
echo "  %APPDATA%/Claude/claude_desktop_config.json (Windows)"
echo ""
cat mcp/claude_desktop_config.json
