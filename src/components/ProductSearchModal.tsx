"use client";

import { useState, useEffect } from "react";
import { ProductModel } from "@/domain/models/types";
import { Search, X, ChevronLeft, ChevronRight, PackageCheck, AlertTriangle } from "lucide-react";

interface ProductSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: ProductModel, quantity: number) => void;
  onShowToast: (message: string, type: "success" | "error") => void;
  existingProductIds: string[];
}

export default function ProductSearchModal({
  isOpen,
  onClose,
  onSelectProduct,
  onShowToast,
  existingProductIds,
}: ProductSearchModalProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedQuantities, setSelectedQuantities] = useState<{ [productId: string]: number }>({});

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen, query, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/products?query=${encodeURIComponent(query)}&page=${page}&limit=5`
      );
      const data = await res.json();
      if (res.ok) {
        setProducts(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);

        // Initialize default quantity of 1 for fetched products
        const defaultQty: { [id: string]: number } = {};
        (data.data || []).forEach((prod: ProductModel) => {
          defaultQty[prod.id] = 1;
        });
        setSelectedQuantities(defaultQty);
      } else {
        onShowToast(data.error || "Error al cargar productos", "error");
      }
    } catch (err) {
      onShowToast("Error de conexión al buscar productos", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (productId: string, val: number, stock: number) => {
    // Requirement #9: Stock limit validation
    if (val > stock) {
      onShowToast(`No se puede vender más del stock disponible (${stock} unidades).`, "error");
      return;
    }
    if (val < 1) return;

    setSelectedQuantities((prev) => ({
      ...prev,
      [productId]: val,
    }));
  };

  const handleAdd = (product: ProductModel) => {
    // Requirement #3: Check duplicate product
    if (existingProductIds.includes(product.id)) {
      onShowToast(
        `El producto "${product.name}" ya se encuentra agregado a la orden.`,
        "error"
      );
      return;
    }

    const qty = selectedQuantities[product.id] || 1;
    if (qty > product.stock) {
      onShowToast(`Stock insuficiente. Stock actual: ${product.stock}`, "error");
      return;
    }

    onSelectProduct(product, qty);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <PackageCheck className="h-5 w-5 text-blue-400" />
            Búsqueda Inteligente de Productos (Solo Stock Disponible &gt; 0)
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por Código de Producto o Nombre..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Table */}
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Código</th>
                  <th className="px-4 py-3">Producto</th>
                  <th className="px-4 py-3 text-right">P. Unitario</th>
                  <th className="px-4 py-3 text-center">Stock</th>
                  <th className="px-4 py-3 text-center">Cantidad</th>
                  <th className="px-4 py-3 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      Buscando productos...
                    </td>
                  </tr>
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No se encontraron productos con stock mayor a cero.
                    </td>
                  </tr>
                ) : (
                  products.map((prod) => {
                    const isAlreadyAdded = existingProductIds.includes(prod.id);
                    const currentQty = selectedQuantities[prod.id] || 1;

                    return (
                      <tr
                        key={prod.id}
                        className={`hover:bg-blue-50/50 transition-colors ${
                          isAlreadyAdded ? "bg-slate-50 opacity-75" : ""
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">
                          {prod.code}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {prod.name}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          ${prod.unitPrice.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800">
                            {prod.stock} disponibles
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <input
                            type="number"
                            min={1}
                            max={prod.stock}
                            value={currentQty}
                            disabled={isAlreadyAdded}
                            onChange={(e) =>
                              handleQuantityChange(
                                prod.id,
                                parseInt(e.target.value, 10) || 1,
                                prod.stock
                              )
                            }
                            className="w-16 px-2 py-1 border rounded text-center text-xs focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isAlreadyAdded ? (
                            <span className="text-xs text-amber-600 font-medium flex items-center justify-center gap-1">
                              <AlertTriangle className="h-3.5 w-3.5" /> En Orden
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAdd(prod)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors"
                            >
                              Agregar
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Block Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>
              Mostrando {products.length} de {totalCount} productos con stock (Página {page} de {totalPages})
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
      </div>
    </div>
  );
}
