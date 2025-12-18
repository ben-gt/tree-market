import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISiteSettings extends Document {
  _id: mongoose.Types.ObjectId;
  logoUrl?: string;
  heroTitle: string;
  heroDescription: string;
  ctaTitle: string;
  ctaDescription: string;
  updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
  {
    logoUrl: { type: String },
    heroTitle: { type: String, default: "Find Your Perfect Tree" },
    heroDescription: {
      type: String,
      default:
        "Connect with property owners, demolition sites, and tree sellers. Quality ex-ground stock for landscape architects, developers, and enthusiasts.",
    },
    ctaTitle: { type: String, default: "Ready to Get Started?" },
    ctaDescription: {
      type: String,
      default:
        "Whether you have trees to sell or are looking for the perfect specimen, Tree Market connects you with the right people.",
    },
  },
  { timestamps: true }
);

export const SiteSettings: Model<ISiteSettings> =
  mongoose.models.SiteSettings ||
  mongoose.model<ISiteSettings>("SiteSettings", SiteSettingsSchema);
