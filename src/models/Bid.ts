import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBid extends Document {
  _id: mongoose.Types.ObjectId;
  listingId: mongoose.Types.ObjectId;
  bidderId: mongoose.Types.ObjectId;
  amount: number;
  message?: string;
  status: "pending" | "accepted" | "rejected" | "withdrawn";
  createdAt: Date;
}

const BidSchema = new Schema<IBid>(
  {
    listingId: { type: Schema.Types.ObjectId, ref: "Listing", required: true },
    bidderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "withdrawn"],
      default: "pending",
    },
  },
  { timestamps: true }
);

BidSchema.index({ listingId: 1, amount: -1 });
BidSchema.index({ bidderId: 1 });

export const Bid: Model<IBid> =
  mongoose.models.Bid || mongoose.model<IBid>("Bid", BidSchema);
