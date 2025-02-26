// src/models/LabelTemplate.ts
import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILabelTemplate extends Document {
  userId: string;
  name: string;
  width: number;
  height: number;
  createdAt: Date;
}

const LabelTemplateSchema: Schema<ILabelTemplate> = new Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create a compound index for userId and name to ensure uniqueness
LabelTemplateSchema.index({ userId: 1, name: 1 }, { unique: true });

const LabelTemplate: Model<ILabelTemplate> = mongoose.models.LabelTemplate || mongoose.model<ILabelTemplate>("LabelTemplate", LabelTemplateSchema);
export default LabelTemplate;