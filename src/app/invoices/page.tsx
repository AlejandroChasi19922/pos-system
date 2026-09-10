"use client";

import { useState, useEffect } from "react";
import { SalesOrderModel } from "@/domain/models/types";
import InvoiceViewerModal from "@/components/InvoiceViewerModal";
import Toast from "@/components/Toast";
import {
  FileText,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  DollarSign,
} from "lucide-react";

export default function InvoicesHistoryPage() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [orders, setOrders] = useState<SalesOrderModel[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<SalesOrderModel | null>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [query, page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/sales-orders?query=${encodeURIComponent(query)}&page=${page}&limit=5`
      );
      const data = await res.json();
      if (res.ok) {
        setOrders(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      } else {
        setToast({ message: data.error || "Error al cargar las facturas", type: "error" });
      }
    } catch (err) {
      setToast({ message: "Error de conexión al buscar facturas guardadas", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOrder = (order: SalesOrderModel) => {
    setSelectedOrder(order);
    setIsInvoiceModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            Historial & Búsqueda de Facturas Guardadas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Reconstruya cualquier factura guardada y visualícela en formato PDF para impresión o descarga.
          </p>
        </div>

        {/* Search input (Req #12 & #15: Search by order number or customer) */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por N° Factura o Nombre de Cliente..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">N° Factura</th>
              <th className="px-6 py-4">Cliente (Cédula / Nombre)</th>
              <th className="px-6 py-4">Fecha de Emisión</th>
              <th className="px-6 py-4 text-right">Subtotal</th>
              <th className="px-6 py-4 text-right">IVA (15%)</th>
              <th className="px-6 py-4 text-right">Total</th>
              <th className="px-6 py-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  Cargando historial de facturas...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                  No se encontraron facturas guardadas que coincidan con la búsqueda.
                </td>
              </tr>
            ) : (
              orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-blue-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-blue-700">
                    FACT-001-{String(ord.orderNumber).padStart(6, "0")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-slate-900">
                      {ord.customer?.firstName} {ord.customer?.lastName}
                    </div>
                    <div className="text-xs font-mono text-slate-500">
                      CI: {ord.customer?.dniTaxId}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {new Date(ord.issueDate).toLocaleDateString("es-EC")}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-700">
                    ${ord.subtotal.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono text-slate-700">
                    ${ord.taxAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-700 text-base">
                    ${ord.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleOpenOrder(ord)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                      Reconstruir PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Block Pagination */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando {orders.length} de {totalCount} facturas (Página {page} de {totalPages})
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Invoice PDF Viewer Modal */}
      <InvoiceViewerModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        order={selectedOrder}
      />

      {/* Toast */}
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
