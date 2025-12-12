const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle, 
        WidthType, ShadingType, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

// Costco brand colors
const COSTCO_RED = "E31837";
const COSTCO_BLUE = "003DA5";
const DARK_GRAY = "333333";
const LIGHT_GRAY = "F5F5F5";
const BORDER_GRAY = "CCCCCC";
const SUCCESS_GREEN = "10B981";
const WARNING_YELLOW = "F59E0B";

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: BORDER_GRAY };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 48, bold: true, color: COSTCO_BLUE, font: "Arial" },
        paragraph: { spacing: { before: 0, after: 200 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 32, bold: true, color: COSTCO_RED, font: "Arial" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, color: DARK_GRAY, font: "Arial" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: COSTCO_BLUE, font: "Arial" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-list",
        levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-1",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-2",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-list-3",
        levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [{
    properties: {
      page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } }
    },
    headers: {
      default: new Header({ children: [new Paragraph({ 
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: "INTERNAL", bold: true, size: 18, color: COSTCO_BLUE }),
          new TextRun({ text: " | Team Update", size: 18, color: "666666" })
        ]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Costco Business Center Analytics POC | Page ", size: 18, color: "666666" }), 
          new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "666666" }), 
          new TextRun({ text: " of ", size: 18, color: "666666" }), 
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "666666" })
        ]
      })] })
    },
    children: [
      // Title
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("Team Update")] }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        children: [new TextRun({ text: "Costco Business Center AI-Powered Analytics Platform", size: 24, color: "666666" })]
      }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "POC Development Plan & Status | December 2025", size: 20, color: "999999" })]
      }),

      // Project Overview
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Project Overview")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 What Are We Building?")] }),
      new Paragraph({ spacing: { after: 200 }, children: [new TextRun("We are building an AI-Powered Analytics Platform for Costco Business Center that combines traditional BI dashboards with conversational AI. The platform enables users to ask questions in natural language and receive instant insights, predictions, and recommendations.")] }),
      
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Key Capabilities:", bold: true })] }),
      new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, children: [new TextRun({ text: "Talk-to-Data Interface: ", bold: true }), new TextRun("Natural language queries like \"Why did sales drop last month?\" or \"Forecast next quarter's revenue\"")] }),
      new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, children: [new TextRun({ text: "Interactive Dashboards: ", bold: true }), new TextRun("Real-time visualization of KPIs, revenue trends, lead funnel, and marketer performance")] }),
      new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, children: [new TextRun({ text: "ML Predictions: ", bold: true }), new TextRun("Sales forecasting, lead conversion probability, and member segmentation")] }),
      new Paragraph({ numbering: { reference: "numbered-list-1", level: 0 }, children: [new TextRun({ text: "Image Recognition POC: ", bold: true }), new TextRun("Take a photo in a client's business and find matching products at the local Business Center")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 The Four Pillars of Analytics")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun("Our solution addresses all four levels of the analytics maturity model:")] }),
      
      new Table({
        columnWidths: [2340, 2340, 4680],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Level", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Question", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Example", bold: true, color: "FFFFFF", size: 20 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Descriptive", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "What happened?", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "\"What is our total revenue by warehouse?\"", italics: true, size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Diagnostic", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Why did it happen?", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "\"Why did Warehouse 120 underperform?\"", italics: true, size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Predictive", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "What will happen?", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "\"Forecast next month's sales\"", italics: true, size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Prescriptive", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "What should we do?", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "\"Which leads should we prioritize?\"", italics: true, size: 20 })] })] })
          ]})
        ]
      }),

      // Page Break
      new Paragraph({ children: [new PageBreak()] }),

      // Technical Architecture
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Technical Architecture")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 GCP Technology Stack")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun("We are using a 100% GCP-native architecture for seamless integration and enterprise support:")] }),
      
      new Table({
        columnWidths: [2340, 3120, 3900],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_RED, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Layer", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: COSTCO_RED, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Technology", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: COSTCO_RED, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Purpose", bold: true, color: "FFFFFF", size: 20 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Data Warehouse", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "BigQuery", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Store all analytics data (leads, members, sales, touchpoints)", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "ML Models", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "BigQuery ML", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "ARIMA+ forecasting, logistic regression for lead scoring", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "AI/LLM", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Vertex AI Gemini 2.0", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Natural language processing, SQL generation, orchestration", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Image AI", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Vertex AI Vision", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Product detection from client photos", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Backend API", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Cloud Run + FastAPI", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Serverless API hosting, auto-scaling", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Frontend", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "React + Tailwind + Recharts", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Modern, responsive dashboard and chat UI", size: 20 })] })] })
          ]})
        ]
      }),

      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 How the AI Agent Works")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun("The Talk-to-Data feature uses Gemini 2.0 with a tool-based architecture:")] }),
      
      new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, children: [new TextRun({ text: "User asks a question: ", bold: true }), new TextRun("\"Why did sales drop in November?\"")] }),
      new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, children: [new TextRun({ text: "Gemini analyzes intent: ", bold: true }), new TextRun("Identifies this as a diagnostic (WHY) question")] }),
      new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, children: [new TextRun({ text: "Gemini generates SQL: ", bold: true }), new TextRun("Creates BigQuery queries to analyze segment performance")] }),
      new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, children: [new TextRun({ text: "Executes query: ", bold: true }), new TextRun("Runs SQL against BigQuery, retrieves data")] }),
      new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, children: [new TextRun({ text: "Synthesizes response: ", bold: true }), new TextRun("Gemini analyzes results and explains root causes")] }),
      new Paragraph({ numbering: { reference: "numbered-list-2", level: 0 }, children: [new TextRun({ text: "Generates visualization: ", bold: true }), new TextRun("Creates chart configuration for frontend rendering")] }),

      // Page Break
      new Paragraph({ children: [new PageBreak()] }),

      // Data Model
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Data Model")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun("Our BigQuery schema consists of 7 core tables:")] }),
      
      new Table({
        columnWidths: [2340, 3120, 3900],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Table", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Records (Sample)", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Key Fields", bold: true, color: "FFFFFF", size: 20 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "warehouses", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "warehouse_id, name, region, city, state", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "marketers", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "marketer_id, name, warehouse_id, is_active", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "industries", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "7", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "industry_code, description, category, avg_order_value", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "leads", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "500", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "lead_id, status, marketer_id, industry_code, source", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "members", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "149", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "member_id, membership_type, lifetime_value, warehouse_id", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "pos_sales", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1,562", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "sale_id, member_id, amount, fiscal_year, fiscal_period", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "lead_touchpoints", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1,931", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3900, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "touchpoint_id, lead_id, type, outcome, date", size: 20 })] })] })
          ]})
        ]
      }),

      new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "Sample Data Statistics:", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Total Revenue: $1,051,745.33")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Overall Conversion Rate: 29.8%")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Converted Leads: 149 (out of 500)")] }),

      // Page Break
      new Paragraph({ children: [new PageBreak()] }),

      // Timeline
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Development Timeline")] }),
      
      new Table({
        columnWidths: [1560, 3120, 2340, 2340],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, shading: { fill: COSTCO_RED, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Week", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: COSTCO_RED, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Focus Area", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_RED, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Deliverables", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_RED, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Status", bold: true, color: "FFFFFF", size: 20 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Week 1", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Data Foundation", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "BigQuery schema, sample data", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: "D4EDDA", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "✓ COMPLETE", bold: true, color: SUCCESS_GREEN, size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Week 2", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Backend Development", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "FastAPI + Vertex AI agent", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: "D4EDDA", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "✓ COMPLETE", bold: true, color: SUCCESS_GREEN, size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Week 3", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Frontend Development", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Dashboard + Chat UI", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: "D4EDDA", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "✓ COMPLETE", bold: true, color: SUCCESS_GREEN, size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 1560, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Week 4", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Integration & Polish", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Testing, demo prep", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "IN PROGRESS", bold: true, color: WARNING_YELLOW, size: 20 })] })] })
          ]})
        ]
      }),

      // Deliverables
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. What's Been Delivered")] }),
      
      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Backend (Python/FastAPI)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("main.py - Complete API with Vertex AI Gemini integration")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Tool-based agent: query_database, get_sales_forecast, get_lead_conversion_probability, generate_chart")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Dashboard metrics endpoints")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Health check and CORS configuration")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Frontend (React/Tailwind)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Dashboard view with KPI cards and interactive charts")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Talk-to-Data chat interface with suggested questions")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Costco brand styling (red #E31837, blue #003DA5)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Demo fallback responses for offline testing")] }),

      new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Data & Infrastructure")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("BigQuery schema with 7 tables + 3 ML models + 3 analytics views")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Sample data generator (500 leads, 149 members, 1,562 sales)")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Dockerfile and Cloud Build configuration for deployment")] }),

      // Page Break
      new Paragraph({ children: [new PageBreak()] }),

      // Next Steps
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Next Steps")] }),
      
      new Paragraph({ spacing: { after: 100 }, children: [new TextRun({ text: "Immediate (This Week):", bold: true })] }),
      new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, children: [new TextRun("Deploy to GCP (Cloud Run + BigQuery)")] }),
      new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, children: [new TextRun("Load sample data into BigQuery")] }),
      new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, children: [new TextRun("Test end-to-end Talk-to-Data flow")] }),
      new Paragraph({ numbering: { reference: "numbered-list-3", level: 0 }, children: [new TextRun("Prepare demo script for client presentation")] }),

      new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "Before January Demo:", bold: true })] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Refine UI based on internal feedback")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Add more demo scenarios and fallback responses")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Create presentation deck for Business Center Leadership")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Document all APIs and configuration")] }),

      // Team Assignments
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Team Responsibilities")] }),
      
      new Table({
        columnWidths: [3120, 6240],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Role", bold: true, color: "FFFFFF", size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Responsibilities", bold: true, color: "FFFFFF", size: 20 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Project Lead", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Coordination, client communication, demo presentation", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Data Engineer", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "BigQuery setup, data model, BQML models, data loading", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "AI/ML Engineer", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Vertex AI agent, Gemini integration, tool development", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Frontend Developer", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "React dashboard, chat UI, charts, responsive design", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "DevOps Engineer", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 6240, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "GCP deployment, CI/CD, monitoring, security", size: 20 })] })] })
          ]})
        ]
      }),

      // Questions
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Open Questions")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("GCP Project Access: Do we have a project set up with billing enabled?")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Real Data: When can we get access to actual Costco data for testing?")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Demo Date: Confirm exact date for January presentation")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun("Looker Integration: Is Looker dashboard embedding required for POC?")] }),

      // Contact
      new Paragraph({ spacing: { before: 600 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Questions? Contact the project lead or post in #costco-analytics-poc Slack channel", italics: true, size: 20, color: "666666" })] })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/Costco_POC_Team_Update.docx", buffer);
  console.log("Team Update document created successfully!");
});
