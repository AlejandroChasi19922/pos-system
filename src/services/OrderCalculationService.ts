export interface OrderLineInput {
  productId: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderTotals {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
}

export class OrderCalculationService {
  public static readonly DEFAULT_TAX_RATE = 0.15; // 15% IVA Ecuador

  /**
   * Calculates order totals from line items.
   */
  public static calculateTotals(
    items: OrderLineInput[],
    taxRate: number = OrderCalculationService.DEFAULT_TAX_RATE
  ): OrderTotals {
    const rawSubtotal = items.reduce((acc, item) => {
      return acc + item.unitPrice * item.quantity;
    }, 0);

    const subtotal = Math.round(rawSubtotal * 100) / 100;
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;

    return {
      subtotal,
      taxRate,
      taxAmount,
      total,
    };
  }
}
