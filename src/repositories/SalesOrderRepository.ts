import { prisma } from "@/lib/prisma";
import { CreateOrderDTO, SalesOrderModel } from "@/domain/models/types";
import { OrderCalculationService } from "@/services/OrderCalculationService";
import { PaginatedResult } from "./CustomerRepository";

export class SalesOrderRepository {
  /**
   * Creates a new Sales Order within an ATOMIC DATABASE TRANSACTION.
   * Enforces:
   * - Requirement #3: Unique products in details list.
   * - Requirement #7: Automatic inventory reduction in products table.
   * - Requirement #9: Stock sufficiency check.
   * - Requirement #17: ACID Transactions & Concurrency management.
   */
  public async createSalesOrder(dto: CreateOrderDTO): Promise<SalesOrderModel> {
    if (!dto.customerId) {
      throw new Error("Customer ID is required to create a sales order.");
    }

    if (!dto.details || dto.details.length === 0) {
      throw new Error("Sales order must contain at least one detail line item.");
    }

    // Check for duplicate products in the order request (Requirement #3)
    const productIds = dto.details.map((d) => d.productId);
    const uniqueProductIds = new Set(productIds);
    if (uniqueProductIds.size !== productIds.length) {
      throw new Error("Duplicate products are not allowed in the same sales order.");
    }

    // Execute atomic transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Validate customer existence
      const customer = await tx.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer) {
        throw new Error(`Customer with ID ${dto.customerId} not found.`);
      }

      // 2. Compute next sequential order number
      const maxOrder = await tx.salesOrder.findFirst({
        orderBy: { orderNumber: "desc" },
        select: { orderNumber: true },
      });
      const nextOrderNumber = (maxOrder?.orderNumber || 0) + 1;

      // 3. Validate products and stock availability (Requirement #9)
      const updatedLineItems = [];

      for (const line of dto.details) {
        const product = await tx.product.findUnique({
          where: { id: line.productId },
        });

        if (!product) {
          throw new Error(`Product ID ${line.productId} not found.`);
        }

        if (product.stock < line.quantity) {
          throw new Error(
            `Insufficient stock for '${product.name}'. Available: ${product.stock}, Requested: ${line.quantity}`
          );
        }

        const subtotal = line.unitPrice * line.quantity;
        updatedLineItems.push({
          productId: line.productId,
          unitPrice: line.unitPrice,
          quantity: line.quantity,
          subtotal,
        });

        // 4. Decrement inventory stock automatically (Requirement #7)
        await tx.product.update({
          where: { id: line.productId },
          data: {
            stock: {
              decrement: line.quantity,
            },
          },
        });
      }

      // 5. Calculate master header totals (Requirement #4)
      const totals = OrderCalculationService.calculateTotals(dto.details);

      // 6. Create Master Sales Order & Details
      const createdOrder = await tx.salesOrder.create({
        data: {
          orderNumber: nextOrderNumber,
          customerId: dto.customerId,
          subtotal: totals.subtotal,
          taxRate: totals.taxRate,
          taxAmount: totals.taxAmount,
          total: totals.total,
          details: {
            create: updatedLineItems.map((item) => ({
              productId: item.productId,
              unitPrice: item.unitPrice,
              quantity: item.quantity,
              subtotal: item.subtotal,
            })),
          },
        },
        include: {
          customer: true,
          details: {
            include: {
              product: true,
            },
          },
        },
      });

      return createdOrder as SalesOrderModel;
    });
  }

  /**
   * Search saved sales orders with pagination for lookup and invoice view.
   * Requirement #12 & #15: Search saved invoices by order number or customer name.
   */
  public async searchSalesOrders(
    query: string = "",
    page: number = 1,
    limit: number = 5
  ): Promise<PaginatedResult<SalesOrderModel>> {
    const skip = (page - 1) * limit;
    const cleanQuery = query.trim();

    let whereCondition: any = {};

    if (cleanQuery) {
      const isNumber = !isNaN(Number(cleanQuery));
      if (isNumber) {
        whereCondition = {
          orderNumber: Number(cleanQuery),
        };
      } else {
        whereCondition = {
          customer: {
            OR: [
              { firstName: { contains: cleanQuery } },
              { lastName: { contains: cleanQuery } },
              { dniTaxId: { contains: cleanQuery } },
            ],
          },
        };
      }
    }

    const [total, data] = await Promise.all([
      prisma.salesOrder.count({ where: whereCondition }),
      prisma.salesOrder.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          customer: true,
          details: {
            include: {
              product: true,
            },
          },
        },
      }),
    ]);

    return {
      data: data as SalesOrderModel[],
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single order by ID for invoice reconstruction (Requirement #12)
   */
  public async getSalesOrderById(id: string): Promise<SalesOrderModel | null> {
    const order = await prisma.salesOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        details: {
          include: {
            product: true,
          },
        },
      },
    });

    return order as SalesOrderModel | null;
  }
}
