import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/models/Product";

export async function POST(req: Request) {
  try {
    await connectDB();
    const { products } = await req.json();

    if (!products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "Invalid product data" }, { status: 400 });
    }

    // Insert all products in bulk
    await Product.insertMany(products);

    return NextResponse.json({ message: "Products uploaded successfully" }, { status: 201 });
  } catch (error) {
    console.error("Bulk Product Upload Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
