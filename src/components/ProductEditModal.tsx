"use client";

import { useState, useEffect } from "react";
import { ProductModel } from "@/domain/models/types";
import { RefreshCw, Search, X, Check } from "lucide-react";

interface ProductEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProductIndex: number | null;
  onReplaceProduct: (index: number, newProduct: ProductModel, quantity: number) => void;
  onShowToast: (message: string, type: "success" | "error") => void;
  existingProductIds: string[];
}

export default function ProductEditModal({
  isOpen,
  onClose,
  targetProductIndex,
  onReplaceProduct,
  onShowToast,
  existingProductIds,
}: ProductEditModalProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedQty, setSelectedQty] = useState(1);

  useEffect(() => {
    if (isOpen && targetProductIndex !== null) {
      fetchProducts();
    }
  }, [isOpen, query, targetProductIndex]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?query=${encodeURIComponent(query)}&limit=10`);
      const data = await res.json();
      if (res.ok) {
        setProducts(data.data || []);
      }
    } catch (err) {
      onShowToast("Error al cargar lista de productos para reemplazo", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || targetProductIndex === null) return null;

  const handleSelect = (prod: ProductModel) => {
    if (selectedQty > prod.stock) {
      onShowToast(`Stock insuficiente. Stock disponible: ${prod.stock}`, "error");
      return;
    }

    onReplaceProduct(targetProductIndex, prod, selectedQty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <RefreshCw className="h-5 w-5" />
            Reemplazar / Cambiar Producto en la Orden
          </h2>
          <button onClick={onClose} className="text-amber-100 hover:text-white p-1">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-600">
            Seleccione un nuevo producto para sustituir el item actual sin modificar el resto de la orden.
          </p>

          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar nuevo producto..."
                className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">Cantidad:</label>
              <input
                type="number"
                min={1}
                value={selectedQty}
                onChange={(e) => setSelectedQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 px-2 py-1 border rounded text-center text-sm font-bold"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b">
                <tr>
                  <th className="px-4 py-2">Código</th>
                  <th className="px-4 py-2">Producto</th>
                  <th className="px-4 py-2 text-right">Precio</th>
                  <th className="px-4 py-2 text-center">Stock</th>
                  <th className="px-4 py-2 text-center">Seleccionar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      Cargando productos...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                      No hay productos disponibles.
                    </td>
                  </tr>
                ) : (
                  products.map((p) => (
                    <tr key={p.id} className="hover:bg-amber-50/50">
                      <td className="px-4 py-2 font-mono text-xs">{p.code}</td>
                      <td className="px-4 py-2 font-medium text-slate-900">{p.name}</td>
                      <td className="px-4 py-2 text-right font-semibold">${p.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-2 text-center text-xs font-bold text-emerald-700">
                        {p.stock}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={() => handleSelect(p)}
                          className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Check className="h-3.5 w-3.5" /> Reemplazar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
