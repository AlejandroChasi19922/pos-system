import { prisma } from "@/lib/prisma";
import { CustomerModel } from "@/domain/models/types";

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CustomerRepository {
  /**
   * Search customers intelligent multi-field query with pagination.
   * Requirement #15: Search by at least 2 fields (DNI/RUC, Name) with block pagination.
   */
  public async searchCustomers(
    query: string = "",
    page: number = 1,
    limit: number = 5
  ): Promise<PaginatedResult<CustomerModel>> {
    const skip = (page - 1) * limit;
    const cleanQuery = query.trim();

    const whereCondition = cleanQuery
      ? {
          OR: [
            { dniTaxId: { contains: cleanQuery } },
            { firstName: { contains: cleanQuery } },
            { lastName: { contains: cleanQuery } },
          ],
        }
      : {};

    const [total, data] = await Promise.all([
      prisma.customer.count({ where: whereCondition }),
      prisma.customer.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { lastName: "asc" },
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

  public async getCustomerById(id: string): Promise<CustomerModel | null> {
    return prisma.customer.findUnique({ where: { id } });
  }

  public async createCustomer(customerData: Omit<CustomerModel, "id" | "createdAt">): Promise<CustomerModel> {
    return prisma.customer.create({ data: customerData });
  }
}
