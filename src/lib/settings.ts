import dbConnect from "./mongodb";
import { SiteSettings, type ISiteSettings } from "@/models";

export async function getSiteSettings(): Promise<ISiteSettings> {
  await dbConnect();

  let settings = await SiteSettings.findOne().lean();

  if (!settings) {
    // Create default settings if none exist
    settings = await SiteSettings.create({});
    settings = settings.toObject();
  }

  return settings as ISiteSettings;
}
