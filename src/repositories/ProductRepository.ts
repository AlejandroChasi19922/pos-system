import { prisma } from "@/lib/prisma";
import { ProductModel } from "@/domain/models/types";
import { PaginatedResult } from "./CustomerRepository";

export class ProductRepository {
  /**
   * Search available products with stock > 0 by at least 2 fields (code or name) with pagination.
   * Requirement #8: ONLY products with stock > 0 are displayed/selectable.
   * Requirement #15: Block paginated search by 2+ fields.
   */
  public async searchAvailableProducts(
    query: string = "",
    page: number = 1,
    limit: number = 5
  ): Promise<PaginatedResult<ProductModel>> {
    const skip = (page - 1) * limit;
    const cleanQuery = query.trim();

    const whereCondition: any = {
      stock: { gt: 0 }, // Requirement #8: ONLY stock > 0
    };

    if (cleanQuery) {
      whereCondition.AND = [
        {
          OR: [
            { code: { contains: cleanQuery } },
            { name: { contains: cleanQuery } },
          ],
        },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.product.count({ where: whereCondition }),
      prisma.product.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { name: "asc" },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  public async getProductById(id: string): Promise<ProductModel | null> {
    return prisma.product.findUnique({ where: { id } });
  }
}
