import { ImageResponse } from "next/og";
import { type NextRequest } from "next/server";

export const runtime = "edge";
export const alt = "Work Project";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image(
  { params }: { params: { slug: string } },
  parent: any,
) {
  const previousImages = (await parent).openGraph.images || [];
  const title = previousImages[0]?.alt || "Work Project";

  const font = fetch(
    new URL("../../../../public/fonts/Inter.ttf", import.meta.url)
  ).then((res) => res.arrayBuffer());
  const fontData = await font;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          padding: "8rem",
          background: "#151515",
          color: "white",
          fontFamily: "Inter",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
            gap: "2rem",
          }}
        >
          <span
            style={{
              fontSize: "2rem",
              opacity: "0.6",
            }}
          >
            PROJECT
          </span>
          <span
            style={{
              fontSize: "5rem",
              lineHeight: 1,
              letterSpacing: "-0.05em",
              textWrap: "balance",
            }}
          >
            {title}
          </span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          style: "normal",
        },
      ],
    }
  );
} 