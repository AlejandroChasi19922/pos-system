export interface CustomerModel {
  id: string;
  dniTaxId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  address?: string | null;
  createdAt: Date;
}

export interface ProductModel {
  id: string;
  code: string;
  name: string;
  unitPrice: number;
  stock: number;
  createdAt: Date;
}

export interface SalesOrderDetailModel {
  id?: string;
  salesOrderId?: string;
  productId: string;
  product?: ProductModel;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface SalesOrderModel {
  id: string;
  orderNumber: number;
  customerId: string;
  customer?: CustomerModel;
  issueDate: Date;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  createdAt: Date;
  details: SalesOrderDetailModel[];
}

export interface CreateOrderDTO {
  customerId: string;
  details: {
    productId: string;
    unitPrice: number;
    quantity: number;
  }[];
}
