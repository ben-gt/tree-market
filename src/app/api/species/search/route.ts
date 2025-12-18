import { NextRequest, NextResponse } from "next/server";

const ALA_API_BASE = "https://api.ala.org.au/species";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const response = await fetch(
      `${ALA_API_BASE}/search/auto?q=${encodeURIComponent(query)}&idxType=TAXON&limit=10`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("ALA API request failed");
    }

    const data = await response.json();

    // Transform ALA response to a simpler format
    const suggestions = data.autoCompleteList?.map((item: {
      name: string;
      guid?: string;
      commonName?: string;
      rankString?: string;
      matchedNames?: string[];
    }) => ({
      scientificName: item.name,
      guid: item.guid || null,
      commonName: item.commonName || null,
      rank: item.rankString || null,
      matchedNames: item.matchedNames || [],
    })) || [];

    return NextResponse.json(suggestions);
  } catch (error) {
    console.error("Species search error:", error);
    return NextResponse.json(
      { error: "Failed to search species" },
      { status: 500 }
    );
  }
}
