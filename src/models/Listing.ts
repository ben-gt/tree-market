import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPickupWindow {
  type: "specific" | "range" | "flexible";
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  daysOfWeek?: string[];
  notes?: string;
}

export interface IListing extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  species: string;
  height?: number;
  trunkDiameter?: number;
  canopyWidth?: number;
  healthStatus?: "excellent" | "good" | "fair" | "poor";
  age?: number;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  latitude?: number;
  longitude?: number;
  pricingType: "fixed" | "auction";
  price?: number;
  status: "active" | "sold" | "expired" | "removed";
  images: string[];
  pickupWindows: IPickupWindow[];
  sellerId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

const PickupWindowSchema = new Schema<IPickupWindow>(
  {
    type: { type: String, enum: ["specific", "range", "flexible"], required: true },
    date: { type: Date },
    startDate: { type: Date },
    endDate: { type: Date },
    startTime: { type: String },
    endTime: { type: String },
    daysOfWeek: [{ type: String }],
    notes: { type: String },
  },
  { _id: false }
);

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true },
    description: { type: String },
    species: { type: String, required: true },
    height: { type: Number },
    trunkDiameter: { type: Number },
    canopyWidth: { type: Number },
    healthStatus: { type: String, enum: ["excellent", "good", "fair", "poor"] },
    age: { type: Number },
    address: { type: String, required: true },
    suburb: { type: String, required: true },
    state: { type: String, required: true },
    postcode: { type: String, required: true },
    latitude: { type: Number },
    longitude: { type: Number },
    pricingType: { type: String, enum: ["fixed", "auction"], required: true },
    price: { type: Number },
    status: {
      type: String,
      enum: ["active", "sold", "expired", "removed"],
      default: "active",
    },
    images: [{ type: String }],
    pickupWindows: [PickupWindowSchema],
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

ListingSchema.index({ status: 1, createdAt: -1 });
ListingSchema.index({ species: "text", title: "text", suburb: "text" });
ListingSchema.index({ suburb: 1, state: 1 });

export const Listing: Model<IListing> =
  mongoose.models.Listing || mongoose.model<IListing>("Listing", ListingSchema);
