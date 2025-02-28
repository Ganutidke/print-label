import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Create a Product
export async function POST(req: Request) {
  try {
    await connectDB();

    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as { id: string }).id;
    // const userId = session.user?.id; // Ensure userId is available
    const { brandName, productName,productNameEst, packetSize, unit, packetPrice, pricePerUnit} = await req.json();

    // Debugging logs
    console.log("Received Data:", { brandName, productName,productNameEst, packetSize, unit, packetPrice, pricePerUnit, userId });

    // Validation
    if (!brandName || !productName || !packetSize || !unit || !packetPrice || !pricePerUnit || !productNameEst) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const newProduct = new Product({
      userId,
      brandName,
      productName,
      packetSize,
      productNameEst,
      unit,
      packetPrice,
      pricePerUnit,
    });

    await newProduct.save();

    return NextResponse.json(
      { message: "Product created successfully", product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    console.error("Product Creation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Get All Products for a User
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const products = await Product.find({ userId });
    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error("Fetch Products Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Delete a Product
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Delete Product Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Update a Product
export async function PUT(req: Request) {
    try {
      await connectDB();
      
      const { productId, brandName, productName, packetSize, unit, packetPrice, pricePerUnit} = await req.json();
  
      if (!productId) {
        console.error("Product ID missing in request");
        return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
      }
  
      console.log("Updating Product:", { productId, brandName, productName, packetSize, unit, packetPrice, pricePerUnit });
  
      const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        { brandName, productName, packetSize, unit, packetPrice, pricePerUnit},
        { new: true } // Return the updated product
      );
  
      if (!updatedProduct) {
        console.error("Product not found with ID:", productId);
        return NextResponse.json({ error: "Product not found" }, { status: 404 });
      }
  
      return NextResponse.json({ message: "Product updated successfully", product: updatedProduct }, { status: 200 });
    } catch (error) {
      console.error("Update Product Error:", error);
      return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
  }
  