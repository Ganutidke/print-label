import mongoose, { Schema, Document, Model } from "mongoose";

export interface IProduct extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  brandName: string;
  productName: string;
  productNameEst?: string;
  packetSize: number;
  unit: string;
  packetPrice: number;
  pricePerUnit: string;
  createdAt: Date;
}

const ProductSchema: Schema<IProduct> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  brandName: { type: String, required: true },
  productName: { type: String, required: true },
  productNameEst: { type: String },
  packetSize: { type: Number, required: true },
  unit: { type: String, required: true },
  packetPrice: { type: Number, required: true },
  pricePerUnit: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);
export default Product;
