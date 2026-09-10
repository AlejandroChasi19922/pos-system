import { NextResponse } from "next/server";
import { ProductRepository } from "@/repositories/ProductRepository";

const productRepo = new ProductRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    // Requirement #8 & #15: Search ONLY stock > 0, paginated by blocks
    const result = await productRepo.searchAvailableProducts(query, page, limit);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch products" },
      { status: 500 }
    );
  }
}
