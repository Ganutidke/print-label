// src/app/api/labels/route.ts
import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import LabelTemplate from "@/models/LabelTemplate";

export async function GET() {
  await connectDB();
  const labels = await LabelTemplate.find();
  return NextResponse.json(labels);
}
