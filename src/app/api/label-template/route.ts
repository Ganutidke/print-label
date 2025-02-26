import connectDB from "@/lib/db";
import LabelTemplate, { ILabelTemplate } from "@/models/LabelTemplate";
import { NextResponse } from "next/server";

// Create or Update Label Template
export async function POST(req: Request) {
  try {
    await connectDB();
    const { userId, name, width, height } = await req.json();
    console.log(userId, name, width, height);
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
  } catch (error:any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Get Label Template
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  const template = await LabelTemplate.findOne({ user: userId });
  return NextResponse.json(template, { status: 200 });
}
