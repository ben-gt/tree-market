import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  auth0Id: string;
  email: string;
  name?: string;
  phone?: string;
  businessName?: string;
  businessType?: "landscape_architect" | "developer" | "demolition" | "enthusiast" | "other";
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    auth0Id: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String },
    phone: { type: String },
    businessName: { type: String },
    businessType: {
      type: String,
      enum: ["landscape_architect", "developer", "demolition", "enthusiast", "other"],
    },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
