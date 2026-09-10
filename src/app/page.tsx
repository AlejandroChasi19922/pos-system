"use client";

import { useState } from "react";
import { CustomerModel, ProductModel, SalesOrderModel } from "@/domain/models/types";
import { OrderCalculationService } from "@/services/OrderCalculationService";
import CustomerSearchModal from "@/components/CustomerSearchModal";
import ProductSearchModal from "@/components/ProductSearchModal";
import ProductEditModal from "@/components/ProductEditModal";
import InvoiceViewerModal from "@/components/InvoiceViewerModal";
import Toast from "@/components/Toast";
import {
  UserCheck,
  PlusCircle,
  Trash2,
  RefreshCw,
  Save,
  Calculator,
  ShoppingBag,
  Lock,
  Search,
} from "lucide-react";

interface OrderLineState {
  product: ProductModel;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export default function POSMainPage() {
  // Master Header State
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerModel | null>(null);

  // Detail Lines State
  const [lineItems, setLineItems] = useState<OrderLineState[]>([]);

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editLineIndex, setEditLineIndex] = useState<number | null>(null);

  // Saved Order PDF View modal
  const [savedOrder, setSavedOrder] = useState<SalesOrderModel | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  // Loading & Toast
  const [processing, setProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
  };

  // Calculation totals (Req #4)
  const totals = OrderCalculationService.calculateTotals(
    lineItems.map((item) => ({
      productId: item.product.id,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
    }))
  );

  // Add Product to Detail (Req #3, #8, #9)
  const handleAddProduct = (product: ProductModel, quantity: number) => {
    // Check duplicate (Req #3)
    const existingIndex = lineItems.findIndex((item) => item.product.id === product.id);
    if (existingIndex >= 0) {
      showToast(`El producto "${product.name}" ya está en la orden.`, "error");
      return;
    }

    const subtotal = Math.round(product.unitPrice * quantity * 100) / 100;
    setLineItems((prev) => [
      ...prev,
      {
        product,
        quantity,
        unitPrice: product.unitPrice,
        subtotal,
      },
    ]);
    showToast(`Producto "${product.name}" agregado a la venta.`, "success");
  };

  // Quantity Change in Detail Line
  const handleQuantityChange = (index: number, newQty: number) => {
    const item = lineItems[index];
    if (!item) return;

    if (newQty > item.product.stock) {
      showToast(
        `Cantidad supera el stock disponible (${item.product.stock} unidades).`,
        "error"
      );
      return;
    }
    if (newQty < 1) return;

    setLineItems((prev) => {
      const updated = [...prev];
      const subtotal = Math.round(item.unitPrice * newQty * 100) / 100;
      updated[index] = {
        ...item,
        quantity: newQty,
        subtotal,
      };
      return updated;
    });
  };

  // Remove Product from Detail Line (Req #10)
  const handleRemoveProduct = (index: number) => {
    const item = lineItems[index];
    setLineItems((prev) => prev.filter((_, i) => i !== index));
    if (item) {
      showToast(`Producto "${item.product.name}" eliminado de la orden.`, "success");
    }
  };

  // Replace/Swap Product in Detail Line (Req #11)
  const handleReplaceProduct = (index: number, newProduct: ProductModel, quantity: number) => {
    const subtotal = Math.round(newProduct.unitPrice * quantity * 100) / 100;
    setLineItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        product: newProduct,
        quantity,
        unitPrice: newProduct.unitPrice,
        subtotal,
      };
      return updated;
    });
    showToast(`Producto sustituido por "${newProduct.name}" exitosamente.`, "success");
  };

  // Save / Process Sales Order (Req #7, #17)
  const handleProcessOrder = async () => {
    if (!selectedCustomer) {
      showToast("Por favor, seleccione un cliente para la orden de venta.", "error");
      return;
    }

    if (lineItems.length === 0) {
      showToast("Debe agregar al menos un producto al detalle de la venta.", "error");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/sales-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          details: lineItems.map((item) => ({
            productId: item.product.id,
            unitPrice: item.unitPrice,
            quantity: item.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("¡Venta procesada y guardada con éxito! Inventario actualizado.", "success");
        setSavedOrder(data);
        setIsInvoiceModalOpen(true);
        // Clear order state for next sale
        setSelectedCustomer(null);
        setLineItems([]);
      } else {
        showToast(data.error || "Error al guardar la orden de venta", "error");
      }
    } catch (err) {
      showToast("Error de conexión al procesar la venta.", "error");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-blue-600" />
            Nueva Orden de Venta (Punto de Venta / Facturación)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Seleccione el cliente, agregue los productos y procese la factura en tiempo real.
          </p>
        </div>
      </div>

      {/* SECTION 1: MASTER CUSTOMER HEADER (ENCABEZADO DE LA ORDEN) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-blue-600" />
            Encabezado de la Orden (Datos del Cliente)
          </h3>
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Search className="h-4 w-4" />
            {selectedCustomer ? "Cambiar Cliente" : "Buscar / Seleccionar Cliente"}
          </button>
        </div>

        {selectedCustomer ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm bg-blue-50/60 p-4 rounded-lg border border-blue-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Lock className="h-3 w-3 text-slate-400" /> Cédula / RUC (Bloqueado)
              </label>
              <input
                type="text"
                disabled
                value={selectedCustomer.dniTaxId}
                className="w-full mt-1 bg-white border border-slate-300 rounded px-3 py-1.5 font-mono text-slate-800 font-bold text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Lock className="h-3 w-3 text-slate-400" /> Cliente / Nombres (Bloqueado)
              </label>
              <input
                type="text"
                disabled
                value={`${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
                className="w-full mt-1 bg-white border border-slate-300 rounded px-3 py-1.5 font-semibold text-slate-800 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Lock className="h-3 w-3 text-slate-400" /> Correo Electrónico (Bloqueado)
              </label>
              <input
                type="text"
                disabled
                value={selectedCustomer.email}
                className="w-full mt-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-700 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Lock className="h-3 w-3 text-slate-400" /> Teléfono / Dirección (Bloqueado)
              </label>
              <input
                type="text"
                disabled
                value={selectedCustomer.phone || selectedCustomer.address || "N/A"}
                className="w-full mt-1 bg-white border border-slate-300 rounded px-3 py-1.5 text-slate-700 text-xs"
              />
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center text-slate-500">
            <p className="text-sm font-medium">Ningún cliente seleccionado aún.</p>
            <p className="text-xs text-slate-400 mt-1">
              Haga clic en &quot;Buscar / Seleccionar Cliente&quot; para elegir un cliente registrado o crear uno nuevo.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: ORDER DETAILS TABLE (DETALLE DE PRODUCTOS DE LA VENTA) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-blue-600" />
            Detalle de Productos de la Venta ({lineItems.length} ítems)
          </h3>
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Buscar & Agregar Producto
          </button>
        </div>

        {/* Line Items Table */}
        <div className="border border-slate-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Descripción del Producto</th>
                <th className="px-4 py-3 text-right">P. Unitario</th>
                <th className="px-4 py-3 text-center">Cantidad (Editable)</th>
                <th className="px-4 py-3 text-right">Subtotal</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {lineItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    No hay productos agregados a esta orden de venta.
                  </td>
                </tr>
              ) : (
                lineItems.map((item, idx) => (
                  <tr key={item.product.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">
                      {item.product.code}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {item.product.name}
                      <span className="block text-[10px] text-emerald-700">
                        Stock disp: {item.product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      ${item.unitPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {/* Quantity input (Req #5: Edit ONLY necessary fields) */}
                      <input
                        type="number"
                        min={1}
                        max={item.product.stock}
                        value={item.quantity}
                        onChange={(e) =>
                          handleQuantityChange(
                            idx,
                            parseInt(e.target.value, 10) || 1
                          )
                        }
                        className="w-20 px-2 py-1 border border-slate-300 rounded text-center text-sm font-bold text-blue-700 focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      ${item.subtotal.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Replace Product Button (Req #11) */}
                        <button
                          title="Cambiar/Reemplazar por otro producto"
                          onClick={() => {
                            setEditLineIndex(idx);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 text-amber-600 hover:bg-amber-50 rounded transition-colors"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                        {/* Remove Product Button (Req #10) */}
                        <button
                          title="Eliminar de la orden"
                          onClick={() => handleRemoveProduct(idx)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* SECTION 3: TOTALS & PROCESS ORDER PANEL (TOTALES E IVA) */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 space-y-1">
            <p>• Impuesto aplicado: <strong>IVA 15% (Ecuador)</strong>.</p>
            <p>• El inventario se actualizará automáticamente al guardar la factura.</p>
          </div>

          <div className="w-full md:w-80 bg-slate-900 text-white rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center text-slate-300 text-sm">
              <span className="flex items-center gap-1">
                <Calculator className="h-4 w-4 text-blue-400" /> Subtotal:
              </span>
              <span className="font-mono font-semibold">${totals.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-300 text-sm">
              <span>IVA (15%):</span>
              <span className="font-mono font-semibold">${totals.taxAmount.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-700 pt-2 flex justify-between items-center text-lg font-bold">
              <span className="text-blue-400">TOTAL FACTURA:</span>
              <span className="font-mono text-emerald-400">${totals.total.toFixed(2)}</span>
            </div>

            <button
              disabled={processing || !selectedCustomer || lineItems.length === 0}
              onClick={handleProcessOrder}
              className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-lg text-sm flex items-center justify-center gap-2 shadow transition-all disabled:opacity-40 disabled:hover:bg-emerald-500"
            >
              <Save className="h-5 w-5" />
              {processing ? "Guardando Venta..." : "GUARDAR FACTURA (PROCESAR VENTA)"}
            </button>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <CustomerSearchModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelectCustomer={(cust) => setSelectedCustomer(cust)}
        onShowToast={showToast}
      />

      <ProductSearchModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSelectProduct={handleAddProduct}
        onShowToast={showToast}
        existingProductIds={lineItems.map((i) => i.product.id)}
      />

      <ProductEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditLineIndex(null);
        }}
        targetProductIndex={editLineIndex}
        onReplaceProduct={handleReplaceProduct}
        onShowToast={showToast}
        existingProductIds={lineItems.map((i) => i.product.id)}
      />

      <InvoiceViewerModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={savedOrder}
      />

      {/* TOAST ALERTS */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
