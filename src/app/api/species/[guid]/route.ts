import { NextRequest, NextResponse } from "next/server";

const ALA_BIE_BASE = "https://bie.ala.org.au/ws";
const ALA_IMAGES_BASE = "https://images.ala.org.au/image";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guid: string }> }
) {
  const { guid } = await params;

  if (!guid) {
    return NextResponse.json({ error: "GUID required" }, { status: 400 });
  }

  try {
    // Fetch species details from ALA BIE
    const response = await fetch(
      `${ALA_BIE_BASE}/species/${encodeURIComponent(guid)}`,
      {
        headers: { Accept: "application/json" },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "Species not found" },
        { status: 404 }
      );
    }

    const data = await response.json();

    // Build response with image URL if available
    const result: {
      scientificName: string;
      commonName: string | null;
      imageUrl: string | null;
      thumbnailUrl: string | null;
    } = {
      scientificName: data.taxonConcept?.nameString || data.nameString || null,
      commonName: data.commonNames?.[0]?.nameString || null,
      imageUrl: null,
      thumbnailUrl: null,
    };

    // If there's an imageIdentifier, construct the image URLs
    if (data.imageIdentifier) {
      result.imageUrl = `${ALA_IMAGES_BASE}/${data.imageIdentifier}`;
      result.thumbnailUrl = `${ALA_IMAGES_BASE}/proxyImageThumbnail?imageId=${data.imageIdentifier}`;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Species detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch species details" },
      { status: 500 }
    );
  }
}
