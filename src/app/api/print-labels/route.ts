import connectDB from "@/lib/db";
import LabelTemplate from "@/models/LabelTemplate";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { templateId, products, userId } = body;

    if (!templateId) {
      return NextResponse.json({ error: "Missing templateId" }, { status: 400 });
    }
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Missing or invalid products array" }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    try {
      const template = await LabelTemplate.findOne({ id: templateId });

      if (!template) {
        return NextResponse.json({ error: "Template not found" }, { status: 404 });
      }

      
      if (template.userId !== userId) {
        return NextResponse.json({ error: "Unauthorized access to template" }, { status: 403 });
      }

      const labelsHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Product Labels</title>
          <style>
            @media print {
              @page { size: A4; margin: 10mm; }
              body { margin: 0; padding: 0; }
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 10mm;
            }
            .labels-container {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(${template.width}mm, 1fr));
              gap: 1mm;
              justify-content: center;
            }
            .label {
              width: ${template.width}mm;
              height: ${template.height}mm;
              padding: 2mm;
              border: 1px solid #000;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              background-color: #fff;
              overflow: hidden;
            }
            .brand {
              font-weight: normal;
            font-size: 10pt;
            text-align: center;
            }
            .product-container {
              display: flex;
              flex-direction: column;
            }
            .product {
              font-weight: bold;
              font-size: 14pt;
            }
            .price {
              font-size: 18pt;
              text-align: center;
              font-weight: bold;
            }
            .details {
              font-size: 11pt;
              display: flex;
              justify-content: space-between;
              color: #555;
            }
          </style>
        </head>
        <body>
          <div class="labels-container">
            ${products.map(product => {
              const convertedUnit = convertUnit(product.unit, product.packetSize);
              const convertedPricePerUnit = product.pricePerUnit ? (product.pricePerUnit * convertedUnit.multiplier).toFixed(2) : "";
              return `
                <div class="label">
                  <div class="brand">${product.brandName || ''}</div>
                  <div class="product-container">
                    <div class="product">${product.productName || ''}</div>
                    <div class="product">${product.productNameEst || ''}</div>
                  </div>
                  <div class="price">€ ${(product.packetPrice || 0).toFixed(2)}</div>
                  <div class="details">
                    <div>${product.packetSize} ${product.unit}</div>

                    <div>€ ${product.pricePerUnit}/${convertedUnit.unit}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </body>
        </html>
      `;

      return new NextResponse(labelsHTML, {
        headers: {
          "Content-Type": "text/html",
        },
      });

    } catch (err: any) {
      console.error("Error accessing template:", err);
      return NextResponse.json({ error: `Error accessing template: ${err.message}` }, { status: 500 });
    }

  } catch (error: any) {
    console.error("Error in print-labels API:", error);
    return NextResponse.json({ error: error.message || "Failed to generate labels" }, { status: 500 });
  }
}

// Helper function to convert units
function convertUnit(unit: string, size: number) {
  const conversions: { [key: string]: { unit: string, multiplier: number } } = {
    "gm": { unit: "kg", multiplier: 0.001 },
    "ml": { unit: "ltr", multiplier: 0.001 },
    "tk": { unit: "tg", multiplier: 1 },
  };
  
  const conversion = conversions[unit] || { unit, multiplier: 1 };
  return { unit: conversion.unit, value: (size * conversion.multiplier).toFixed(2), multiplier: conversion.multiplier };
}
