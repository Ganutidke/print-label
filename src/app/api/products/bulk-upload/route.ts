import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

// Function to calculate price per unit
const calculatePricePerUnit = (packetSize: number, unit: string, packetPrice: number) => {
  if (!packetSize || !packetPrice) return { pricePerUnit: "0.00", convertedUnit: unit };

  let pricePerUnit;
  let convertedUnit = unit; // Default unit

  if (unit === "gm") {
    pricePerUnit = (packetPrice / packetSize) * 1000; // Convert gm to kg
    convertedUnit = "kg";
  } else if (unit === "ml") {
    pricePerUnit = (packetPrice / packetSize) * 1000; // Convert ml to ltr
    convertedUnit = "ltr";
  } else if (unit === "tk") {
    pricePerUnit = packetPrice / packetSize; // Convert tk as per unit
    convertedUnit = "kg";
  } else {
    pricePerUnit = packetPrice / packetSize; // Default calculation
  }

  return { pricePerUnit: pricePerUnit.toFixed(2), convertedUnit };
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const { products } = await req.json();

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    // Process and insert products
    const formattedProducts = products.map((product) => {
      const { pricePerUnit, convertedUnit } = calculatePricePerUnit(
        Number(product.packetSize),
        product.unit,
        Number(product.packetPrice)
      );

      return {
        ...product,
        pricePerUnit, // Automatically calculated price per unit
        unit: convertedUnit, // Converted unit
      };
    });

    // Insert all formatted products in bulk
    await Product.insertMany(formattedProducts);

    return NextResponse.json({ message: "Products uploaded successfully" }, { status: 201 });
  } catch (error) {
    console.error("Bulk Product Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
