import { NextResponse } from "next/server";
import { getAdminCatalog, toExportPayload } from "@/lib/catalog";
import { requireAdminClient } from "@/lib/supabase/auth";

export async function GET() {
  try {
    await requireAdminClient();
    const payload = toExportPayload(await getAdminCatalog());
    return new NextResponse(JSON.stringify(payload, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="shiye-export-${new Date().toISOString().slice(0, 10)}.json"`,
        "cache-control": "private, no-store"
      }
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
