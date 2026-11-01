import { NextRequest, NextResponse } from "next/server";
import { mapOffProduct, OFF_USER_AGENT, type OffProduct } from "@/lib/offShared";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const barcode = request.nextUrl.searchParams.get("code")?.trim();
  if (!barcode) {
    return NextResponse.json({ result: null });
  }

  const url = `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(
    barcode
  )}.json?fields=code,product_name,brands,nutriments`;

  try {
    const res = await fetch(url, { headers: { "User-Agent": OFF_USER_AGENT, Accept: "application/json" } });
    if (!res.ok) return NextResponse.json({ result: null });
    const data = (await res.json()) as { status?: number; product?: OffProduct };
    if (data.status !== 1 || !data.product) return NextResponse.json({ result: null });
    return NextResponse.json({ result: mapOffProduct(data.product) });
  } catch {
    return NextResponse.json({ error: "Barcode lookup is temporarily unavailable. Try again shortly." }, { status: 502 });
  }
}
