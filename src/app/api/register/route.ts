import { NextResponse } from "next/server";
import User from "@/models/User";
import { hashPassword } from "@/utils/bcrypt";
import connectDB from "@/lib/db";

export async function POST(req: Request) {
  await connectDB();
  const { name, email, password } = await req.json();

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Generate unique ID
  const uniqueId = `user-${Math.random().toString(36).substring(2, 10)}`;

  // Create user with generated ID
  const newUser = new User({
    id: uniqueId,
    name,
    email,
    password: hashedPassword,
  });

  await newUser.save();

  return NextResponse.json({ message: "User registered successfully" }, { status: 201 });
}
