import { NextRequest, NextResponse } from "next/server";
import { searchAllMalls, findLowest } from "@/lib/price-api";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const name = searchParams.get("name")?.trim() || undefined;
  const jan = searchParams.get("jan")?.trim() || undefined;

  if (!name && !jan) {
    return NextResponse.json(
      { error: "商品名またはJANコードのいずれかを指定してください" },
      { status: 400 }
    );
  }

  const result = await searchAllMalls({ name, jan });
  const lowest = findLowest(result.items);

  return NextResponse.json({
    items: result.items,
    errors: result.errors,
    lowest,
    count: result.items.length,
  });
}
