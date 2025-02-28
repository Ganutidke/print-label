// src/models/User.ts
import mongoose, { Schema, Document, Model, ObjectId } from "mongoose";

export interface IUser extends Document {
    _id: ObjectId;
    id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
