import type { NextRequest } from "next/server";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  return Response.json({
    name: "ALINDA Booking",
    short_name: "ALINDA",
    description: "Online randevu",
    start_url: "/" + slug,
    scope: "/" + slug,
    display: "standalone",
    orientation: "portrait",
    background_color: "#FFF6F4",
    theme_color: "#D88982",
    lang: "tr",
    icons: [
      { src: "/icons/alinda-192.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any maskable" },
      { src: "/icons/alinda-512.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" }
    ]
  });
}
