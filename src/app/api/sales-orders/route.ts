import { NextResponse } from "next/server";
import { SalesOrderRepository } from "@/repositories/SalesOrderRepository";

const salesOrderRepo = new SalesOrderRepository();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "5", 10);

    const result = await salesOrderRepo.searchSalesOrders(query, page, limit);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to search sales orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerId, details } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: "Debe seleccionar un cliente antes de procesar la venta." },
        { status: 400 }
      );
    }

    if (!details || !Array.isArray(details) || details.length === 0) {
      return NextResponse.json(
        { error: "Debe agregar al menos un producto a la orden de venta." },
        { status: 400 }
      );
    }

    const newOrder = await salesOrderRepo.createSalesOrder({ customerId, details });
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al procesar la orden de venta" },
      { status: 400 }
    );
  }
}
