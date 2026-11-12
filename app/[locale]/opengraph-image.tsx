import { ImageResponse } from "next/og";

export const alt = "拾页 SHIYE — a curated index of the web";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isZh = locale === "zh";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#f2eee3",
          color: "#17241f",
          padding: "58px 66px",
          fontFamily: "serif"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ width: 46, height: 54, border: "2px solid #17241f" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 34, fontWeight: 700 }}>{isZh ? "拾页" : "SHIYE"}</span>
              <span style={{ fontSize: 13, letterSpacing: 6, color: "#626960" }}>WEB INDEX</span>
            </div>
          </div>
          <span style={{ fontSize: 14, color: "#176b5c", letterSpacing: 3 }}>SHIYE</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 72, lineHeight: 1.1, maxWidth: 980 }}>
            {isZh ? "把互联网，收进一页。" : "The web, kept to one page."}
          </span>
          <span style={{ width: 88, height: 5, background: "#176b5c", marginTop: 28 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #9f9a8c", paddingTop: 20, fontSize: 15, color: "#626960" }}>
          <span>{isZh ? "值得留下的网页索引" : "A curated index of the web"}</span>
          <span>ZH / EN</span>
        </div>
      </div>
    ),
    size
  );
}
