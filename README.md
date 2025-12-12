# Costco Business Center Analytics Platform

## AI-Powered Analytics with Talk-to-Data Capability

A complete POC solution demonstrating advanced analytics capabilities for Costco Business Center, featuring:

- **Descriptive Analytics (What)**: Real-time dashboards and data visualization
- **Diagnostic Analytics (Why)**: AI-powered root cause analysis
- **Predictive Analytics (What Will Happen)**: ML-based forecasting
- **Prescriptive Analytics (What Should I Do)**: Actionable recommendations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Frontend (React + Tailwind)                          │
│  ┌─────────────────────────┐     ┌─────────────────────────────────────────┐│
│  │   Dashboard View        │     │   Talk-to-Data Chat Interface          ││
│  │   (Metrics & Charts)    │     │   "Why did sales drop last month?"     ││
│  └───────────┬─────────────┘     └─────────────────┬───────────────────────┘│
└──────────────┼─────────────────────────────────────┼────────────────────────┘
               │                                     │
               ▼                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                        FastAPI Backend (Python)                               │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                    Vertex AI Gemini 2.0 Agent                           │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  │  │
│  │  │ Natural Lang │  │ SQL Tool     │  │ Predict Tool │  │ Chart Tool │  │  │
│  │  │ Processing   │  │ (BigQuery)   │  │ (BQML)       │  │ (Viz Gen)  │  │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
               │                                     │
               ▼                                     ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                              BigQuery                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │  leads   │  │ members  │  │pos_sales │  │marketers │  │ BQML Models   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │ (Forecasting) │  │
│                                                          └───────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
costco-poc/
├── backend/
│   ├── main.py              # FastAPI application with Vertex AI integration
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Main React application
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Tailwind CSS styles
│   ├── index.html           # HTML template
│   ├── package.json         # Node dependencies
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind configuration
├── sql/
│   └── 01_schema.sql        # BigQuery schema and ML models
├── data/
│   ├── pos_sales_sample.csv # Sample POS data
│   └── generate_sample_data.py  # Data generator script
├── deploy/
│   ├── cloudbuild.yaml      # Cloud Build configuration
│   └── Dockerfile           # Container configuration
└── docs/
    └── README.md            # This file
```

---

## 🚀 Quick Start

### Prerequisites

- Google Cloud Project with billing enabled
- gcloud CLI installed and configured
- Node.js 18+ and npm
- Python 3.11+

### Step 1: Set Up GCP Resources

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
export REGION="us-central1"

# Enable required APIs
gcloud services enable \
  bigquery.googleapis.com \
  aiplatform.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com

# Create BigQuery dataset
bq mk --location=US costco_analytics
```

### Step 2: Load Data into BigQuery

```bash
# Run the schema creation
bq query --use_legacy_sql=false < sql/01_schema.sql

# Generate and load sample data
cd data
python generate_sample_data.py

# Load data to BigQuery
bq load --source_format=NEWLINE_DELIMITED_JSON \
  costco_analytics.leads leads.json

bq load --source_format=NEWLINE_DELIMITED_JSON \
  costco_analytics.members members.json

bq load --source_format=NEWLINE_DELIMITED_JSON \
  costco_analytics.pos_sales pos_sales.json
```

### Step 3: Run Backend Locally

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export GCP_PROJECT_ID="your-project-id"
export GCP_LOCATION="us-central1"

# Run the server
uvicorn main:app --reload --port 8080
```

### Step 4: Run Frontend Locally

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Open http://localhost:3000 in your browser.

---

## 💬 Talk-to-Data Examples

### What (Descriptive)
- "What is our total revenue this year?"
- "Show me sales by warehouse"
- "What are the top 5 industries by transaction count?"

### Why (Diagnostic)
- "Why did Warehouse 120 underperform last quarter?"
- "Why are Restaurant leads converting better than Retail?"
- "Compare conversion rates between lead sources"

### Predict (Predictive)
- "Forecast sales for the next 30 days"
- "Which leads are most likely to convert?"
- "What will revenue look like next month?"

### Recommend (Prescriptive)
- "Which marketers should focus on which industries?"
- "What should we do to improve conversion rates?"
- "Recommend actions to increase Warehouse 115 performance"

---

## 📊 Dashboard Features

1. **Key Metrics Cards**
   - Total Revenue
   - Active Members
   - Conversion Rate
   - Average Transaction Value

2. **Interactive Charts**
   - Revenue by Warehouse (Bar Chart)
   - Revenue by Industry (Pie Chart)
   - Lead Funnel (Area Chart)
   - Top Marketers (Leaderboard)

3. **Real-time Filters**
   - Date range selection
   - Warehouse filter
   - Industry filter

---

## 🔧 BigQuery ML Models

### 1. Sales Forecasting (ARIMA+)
```sql
-- Predict next 30 days of revenue
SELECT * FROM ML.FORECAST(
  MODEL `costco_analytics.sales_forecast_model`,
  STRUCT(30 AS horizon, 0.95 AS confidence_level)
)
```

### 2. Lead Conversion Prediction
```sql
-- Get conversion probability for active leads
SELECT 
  lead_id,
  business_name,
  predicted_is_converted_probs[OFFSET(1)].prob as conversion_probability
FROM ML.PREDICT(
  MODEL `costco_analytics.lead_conversion_model`,
  (SELECT * FROM costco_analytics.leads WHERE status = 'Qualified')
)
ORDER BY conversion_probability DESC
```

### 3. Member Segmentation
```sql
-- Cluster members by behavior
SELECT 
  centroid_id as segment,
  COUNT(*) as member_count,
  AVG(lifetime_value) as avg_ltv
FROM ML.PREDICT(
  MODEL `costco_analytics.member_segments_model`,
  (SELECT * FROM costco_analytics.v_member_metrics)
)
GROUP BY centroid_id
```

---

## ☁️ Deploy to GCP

### Deploy Backend to Cloud Run

```bash
cd backend

# Build and push container
gcloud builds submit --tag gcr.io/$PROJECT_ID/costco-analytics-api

# Deploy to Cloud Run
gcloud run deploy costco-analytics-api \
  --image gcr.io/$PROJECT_ID/costco-analytics-api \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars "GCP_PROJECT_ID=$PROJECT_ID,GCP_LOCATION=$REGION"
```

### Deploy Frontend to Firebase Hosting

```bash
cd frontend

# Build production bundle
npm run build

# Deploy to Firebase
firebase init hosting
firebase deploy
```

---

## 🔒 Security Considerations

1. **Authentication**: Add Firebase Auth or Cloud Identity
2. **API Security**: Use API Gateway with API keys
3. **Data Access**: Implement row-level security in BigQuery
4. **Secrets**: Use Secret Manager for API keys

---

## 📈 Performance Optimization

1. **BigQuery**: Use partitioned tables for large datasets
2. **Caching**: Implement Redis for frequent queries
3. **CDN**: Use Cloud CDN for static assets
4. **Monitoring**: Set up Cloud Monitoring dashboards

---

## 🎯 POC Demo Script

### Demo Flow (15 minutes)

1. **Dashboard Overview** (3 min)
   - Show key metrics
   - Highlight revenue trends
   - Demonstrate filters

2. **Talk-to-Data Demo** (8 min)
   - Start with simple "What is our total revenue?"
   - Progress to "Why did Warehouse 120 underperform?"
   - Show forecasting: "Predict next month's sales"
   - End with recommendation: "Which leads should we prioritize?"

3. **Technical Deep-Dive** (4 min)
   - Show SQL being generated
   - Explain ML model integration
   - Discuss scalability and security

---

## 📞 Support

For questions or issues, contact:
- Technical Lead: [Your Name]
- Email: [Your Email]
- Slack: #costco-analytics-poc

---

## 📄 License

Proprietary - Mastech Digital / Costco Wholesale
