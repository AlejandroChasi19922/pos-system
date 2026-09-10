import { NextResponse } from "next/server";
import { SalesOrderRepository } from "@/repositories/SalesOrderRepository";

const salesOrderRepo = new SalesOrderRepository();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const order = await salesOrderRepo.getSalesOrderById(params.id);
    if (!order) {
      return NextResponse.json(
        { error: "Factura / Orden de venta no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch sales order" },
      { status: 500 }
    );
  }
}
