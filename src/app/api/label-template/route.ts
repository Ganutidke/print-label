import connectDB from "@/lib/db";
import LabelTemplate, { ILabelTemplate } from "@/models/LabelTemplate";
import { log } from "console";
import { NextResponse } from "next/server";

// Create or Update Label Template
export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId, name, width, height } = await req.json();
    if (!userId || !name || !width || !height) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const template = await LabelTemplate.create({
      userId,
      name, // Ensure `name` field is added
      width,
      height,
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get Label Template
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }
  try {
    const templates = await LabelTemplate.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // Return the templates directly as an array to match what the component expects
    return NextResponse.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



export async function PUT(req: Request) {
  try {
    await connectDB();
    const { _id, name, width, height } = await req.json();

    if (!_id || !name || !width || !height) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedTemplate = await LabelTemplate.findByIdAndUpdate(
      _id,
      { name, width, height },
      { new: true }
    );

    return NextResponse.json(updatedTemplate);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete Label Template
export async function DELETE(req: Request) {
  try {
    await connectDB();
    const { id } = await req.json();

    if (!id) return NextResponse.json({ error: "Template ID is required" }, { status: 400 });

    await LabelTemplate.findByIdAndDelete(id);

    return NextResponse.json({ message: "Template deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}