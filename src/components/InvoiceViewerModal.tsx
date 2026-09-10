"use client";

import { SalesOrderModel } from "@/domain/models/types";
import { X, Printer, Download, CheckCircle2, Building2 } from "lucide-react";

interface InvoiceViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: SalesOrderModel | null;
}

export default function InvoiceViewerModal({
  isOpen,
  onClose,
  order,
}: InvoiceViewerModalProps) {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.issueDate).toLocaleDateString("es-EC", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header toolbar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-bold">
              Factura Electrónica N° FACT-001-{String(order.orderNumber).padStart(6, "0")}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Printer className="h-4 w-4" />
              Imprimir / Exportar a PDF
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Invoice PDF Render Container */}
        <div id="invoice-content" className="p-8 flex-1 overflow-y-auto bg-white text-slate-900">
          {/* Printable Invoice Header */}
          <div className="border-b-2 border-slate-900 pb-6 mb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 text-blue-700 font-bold text-2xl mb-1">
                <Building2 className="h-8 w-8" />
                <span>COMERCIAL AMBATO S.A.</span>
              </div>
              <p className="text-xs text-slate-600">RUC: 1890123456001</p>
              <p className="text-xs text-slate-600">Matriz: Av. Los Atahualpas y Victor Hugo, Ambato, Ecuador</p>
              <p className="text-xs text-slate-600">Teléfono: (03) 285-1894 | Email: ventas@comercialambato.com</p>
            </div>
            <div className="text-right border-2 border-slate-900 rounded-lg p-4 bg-slate-50">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">FACTURA</h3>
              <p className="text-lg font-mono font-black text-blue-700">
                001-001-{String(order.orderNumber).padStart(9, "0")}
              </p>
              <p className="text-xs text-slate-500 mt-1">Fecha: {formattedDate}</p>
              <p className="text-[10px] text-emerald-700 font-semibold mt-1">AMBIENTE: PRODUCCIÓN</p>
            </div>
          </div>

          {/* Customer Master Details (Encabezado) */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Razón Social / Cliente:</p>
              <p className="font-semibold text-slate-900">
                {order.customer?.firstName} {order.customer?.lastName}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                <span className="font-medium">Identificación (Cédula/RUC):</span>{" "}
                <span className="font-mono">{order.customer?.dniTaxId}</span>
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Información de Contacto:</p>
              <p className="text-xs text-slate-700">
                <span className="font-medium">Email:</span> {order.customer?.email}
              </p>
              <p className="text-xs text-slate-700">
                <span className="font-medium">Teléfono:</span> {order.customer?.phone || "N/A"}
              </p>
              <p className="text-xs text-slate-700">
                <span className="font-medium">Dirección:</span> {order.customer?.address || "Ambato, Ecuador"}
              </p>
            </div>
          </div>

          {/* Details Table (Detalle de la Orden) */}
          <table className="w-full text-sm text-left border-collapse border border-slate-300 mb-6">
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase">
                <th className="border border-slate-300 px-3 py-2 text-center">Código</th>
                <th className="border border-slate-300 px-3 py-2">Descripción del Producto</th>
                <th className="border border-slate-300 px-3 py-2 text-center">Cant.</th>
                <th className="border border-slate-300 px-3 py-2 text-right">P. Unitario</th>
                <th className="border border-slate-300 px-3 py-2 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.details.map((detail, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="border border-slate-200 px-3 py-2 text-center font-mono text-xs font-bold">
                    {detail.product?.code || "N/A"}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 font-medium">
                    {detail.product?.name || "Producto"}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-center font-bold">
                    {detail.quantity}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono">
                    ${detail.unitPrice.toFixed(2)}
                  </td>
                  <td className="border border-slate-200 px-3 py-2 text-right font-mono font-bold">
                    ${detail.subtotal.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Totals Summary */}
          <div className="flex justify-end">
            <div className="w-64 bg-slate-50 border border-slate-300 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between text-slate-700">
                <span>Subtotal Net 0%:</span>
                <span className="font-mono">$0.00</span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Subtotal IVA 15%:</span>
                <span className="font-mono">${order.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-700 border-b pb-2">
                <span>IVA 15%:</span>
                <span className="font-mono">${order.taxAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-base pt-1">
                <span>VALOR TOTAL:</span>
                <span className="font-mono text-blue-700">${order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-8 border-t pt-4 text-center text-xs text-slate-500">
            <p>Gracias por su compra en Comercial Ambato S.A. | Documento generado automáticamente por el Sistema POS Web.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
