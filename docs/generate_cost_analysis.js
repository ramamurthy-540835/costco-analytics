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
      { reference: "numbered-list",
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
          new TextRun({ text: "CONFIDENTIAL", bold: true, size: 18, color: COSTCO_RED }),
          new TextRun({ text: " | Mastech Digital", size: 18, color: "666666" })
        ]
      })] })
    },
    footers: {
      default: new Footer({ children: [new Paragraph({ 
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: "Costco Business Center Analytics POC - Cost Analysis | Page ", size: 18, color: "666666" }), 
          new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "666666" }), 
          new TextRun({ text: " of ", size: 18, color: "666666" }), 
          new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: "666666" })
        ]
      })] })
    },
    children: [
      // Title
      new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun("GCP Cost Analysis")] }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "Costco Business Center AI-Powered Analytics Platform", size: 24, color: "666666" })]
      }),
      new Paragraph({ 
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [new TextRun({ text: "December 2025 | POC Phase", size: 20, color: "999999" })]
      }),

      // Executive Summary
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Executive Summary")] }),
      new Paragraph({ 
        spacing: { after: 200 },
        children: [new TextRun("This document provides a comprehensive cost analysis for the GCP services required to build and operate the Costco Business Center AI-Powered Analytics Platform. The solution leverages Google Cloud's native services for data warehousing, machine learning, and AI-powered conversational analytics.")]
      }),
      
      // Cost Summary Table
      new Table({
        columnWidths: [4680, 2340, 2340],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phase", bold: true, color: "FFFFFF", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Monthly Cost", bold: true, color: "FFFFFF", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Annual Cost", bold: true, color: "FFFFFF", size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "POC Phase (Development)", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$250 - $400")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$3,000 - $4,800")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Production (Small Scale)", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$800 - $1,500")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$9,600 - $18,000")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Production (Full Scale)", bold: true })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$3,000 - $6,000")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$36,000 - $72,000")] })] })
          ]})
        ]
      }),

      // Page Break
      new Paragraph({ children: [new PageBreak()] }),

      // Detailed Cost Breakdown
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Detailed GCP Service Costs")] }),

      // BigQuery Section
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 BigQuery (Data Warehouse)")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun("BigQuery serves as the central data warehouse for all analytics data including leads, members, POS sales, and touchpoints.")] }),
      
      new Table({
        columnWidths: [3500, 2500, 1680, 1680],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Component", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Pricing Model", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "POC Est.", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Prod Est.", bold: true, size: 20 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Storage (Active)", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "$0.02/GB/month", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$2", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$50", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Queries (On-Demand)", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "$6.25/TB scanned", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$20", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$200", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "BigQuery ML", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "$5/TB + model-specific", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$30", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$150", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Subtotal", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$52/mo", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$400/mo", bold: true, size: 20 })] })] })
          ]})
        ]
      }),

      // Vertex AI Section
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Vertex AI (Gemini 2.0 + ML Platform)")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun("Vertex AI powers the conversational Talk-to-Data interface using Gemini 2.0 Flash for natural language processing and SQL generation.")] }),
      
      new Table({
        columnWidths: [3500, 2500, 1680, 1680],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Component", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Pricing Model", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "POC Est.", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Prod Est.", bold: true, size: 20 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Gemini 2.0 Flash (Input)", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "$0.075/1M tokens", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$15", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$150", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Gemini 2.0 Flash (Output)", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "$0.30/1M tokens", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$60", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$600", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Vision API (Image Recognition)", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "$1.50/1K images", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$15", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$100", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Subtotal", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$90/mo", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$850/mo", bold: true, size: 20 })] })] })
          ]})
        ]
      }),

      // Cloud Run Section
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.3 Cloud Run (API Hosting)")] }),
      new Paragraph({ spacing: { after: 150 }, children: [new TextRun("Cloud Run hosts the FastAPI backend that orchestrates the AI agent and serves the frontend application.")] }),
      
      new Table({
        columnWidths: [3500, 2500, 1680, 1680],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Component", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Pricing Model", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "POC Est.", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Prod Est.", bold: true, size: 20 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "CPU (vCPU-seconds)", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "$0.00002400/vCPU-sec", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$15", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$100", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Memory (GB-seconds)", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "$0.00000250/GB-sec", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$5", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$50", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Requests", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "$0.40/million", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$1", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$20", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3500, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Subtotal", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2500, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$21/mo", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 1680, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$170/mo", bold: true, size: 20 })] })] })
          ]})
        ]
      }),

      // Page Break
      new Paragraph({ children: [new PageBreak()] }),

      // Additional Services
      new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.4 Additional Services")] }),
      
      new Table({
        columnWidths: [3120, 2080, 2080, 2080],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Service", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ children: [new TextRun({ text: "Purpose", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "POC", bold: true, size: 20 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: "E8F4FD", type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Production", bold: true, size: 20 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Cloud Storage", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Data staging, images", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$5/mo", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$50/mo", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Secret Manager", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "API keys, credentials", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$1/mo", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$5/mo", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Cloud Logging", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Monitoring, debugging", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$5/mo", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$30/mo", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Cloud Build", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "CI/CD pipeline", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$2/mo", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$15/mo", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Firebase Hosting", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Frontend hosting", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$0 (free tier)", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$25/mo", size: 20 })] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 3120, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Subtotal", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "", size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$13/mo", bold: true, size: 20 })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2080, type: WidthType.DXA }, shading: { fill: "FFF3CD", type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$125/mo", bold: true, size: 20 })] })] })
          ]})
        ]
      }),

      // Total Summary
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Total Cost Summary")] }),
      
      new Table({
        columnWidths: [4680, 2340, 2340],
        rows: [
          new TableRow({
            tableHeader: true,
            children: [
              new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: COSTCO_RED, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Service Category", bold: true, color: "FFFFFF", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_RED, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "POC Monthly", bold: true, color: "FFFFFF", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_RED, type: ShadingType.CLEAR },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Prod Monthly", bold: true, color: "FFFFFF", size: 22 })] })] })
            ]
          }),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("BigQuery (Data + ML)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$52")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$400")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun("Vertex AI (Gemini + Vision)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$90")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$850")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun("Cloud Run (API)")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$21")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$170")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun("Additional Services")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$13")] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: LIGHT_GRAY, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun("$125")] })] })
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: cellBorders, width: { size: 4680, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "TOTAL ESTIMATED", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$176/mo", bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders: cellBorders, width: { size: 2340, type: WidthType.DXA }, shading: { fill: COSTCO_BLUE, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "$1,545/mo", bold: true, color: "FFFFFF" })] })] })
          ]})
        ]
      }),

      // Cost Optimization
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Cost Optimization Recommendations")] }),
      
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "BigQuery Slots: ", bold: true }), new TextRun("For production, consider flat-rate pricing with reserved slots if query volume exceeds $1,000/month")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Partitioning: ", bold: true }), new TextRun("Partition tables by date to reduce query costs by 80-90%")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Caching: ", bold: true }), new TextRun("Implement Redis/Memorystore for frequently accessed dashboard data")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Committed Use: ", bold: true }), new TextRun("1-year commitments can reduce Vertex AI costs by 20%")] }),
      new Paragraph({ numbering: { reference: "bullet-list", level: 0 }, children: [new TextRun({ text: "Cloud Run Min Instances: ", bold: true }), new TextRun("Set to 0 for POC to avoid idle costs")] }),

      // Footer Note
      new Paragraph({ spacing: { before: 600 }, children: [new TextRun({ text: "Note: ", bold: true, italics: true, size: 20 }), new TextRun({ text: "All estimates are based on GCP pricing as of December 2025 and assume US region deployment. Actual costs may vary based on usage patterns. Contact your Google Cloud representative for enterprise discounts.", italics: true, size: 20 })] })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/mnt/user-data/outputs/Costco_GCP_Cost_Analysis.docx", buffer);
  console.log("Cost Analysis document created successfully!");
});
