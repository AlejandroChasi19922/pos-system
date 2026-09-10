"use client";

import { useState, useEffect } from "react";
import { CustomerModel } from "@/domain/models/types";
import { Search, X, ChevronLeft, ChevronRight, UserPlus, CheckCircle } from "lucide-react";

interface CustomerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCustomer: (customer: CustomerModel) => void;
  onShowToast: (message: string, type: "success" | "error") => void;
}

export default function CustomerSearchModal({
  isOpen,
  onClose,
  onSelectCustomer,
  onShowToast,
}: CustomerSearchModalProps) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [customers, setCustomers] = useState<CustomerModel[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // New Customer Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDni, setNewDni] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen, query, page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/customers?query=${encodeURIComponent(query)}&page=${page}&limit=5`
      );
      const data = await res.json();
      if (res.ok) {
        setCustomers(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      } else {
        onShowToast(data.error || "Error al cargar clientes", "error");
      }
    } catch (err) {
      onShowToast("Error de conexión al buscar clientes", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dniTaxId: newDni,
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          phone: newPhone,
          address: newAddress,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        onShowToast("¡Cliente registrado exitosamente!", "success");
        onSelectCustomer(data);
        setShowCreateForm(false);
        onClose();
      } else {
        onShowToast(data.error || "Error al registrar cliente", "error");
      }
    } catch (err) {
      onShowToast("Error al procesar el registro del cliente", "error");
    } finally {
      setCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-400" />
            Búsqueda Inteligente de Clientes
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
          {!showCreateForm ? (
            <>
              {/* Search input & Toggle Form Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Buscar por Cédula/RUC, Nombres o Apellidos..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors"
                >
                  <UserPlus className="h-4 w-4" />
                  Nuevo Cliente
                </button>
              </div>

              {/* Table / Results */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Cédula / RUC</th>
                      <th className="px-4 py-3">Nombre Completo</th>
                      <th className="px-4 py-3">Correo Electrónico</th>
                      <th className="px-4 py-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          Buscando clientes...
                        </td>
                      </tr>
                    ) : customers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                          No se encontraron clientes coincidentes.
                        </td>
                      </tr>
                    ) : (
                      customers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-blue-50/50 transition-colors">
                          <td className="px-4 py-3 font-mono font-medium text-slate-900">
                            {cust.dniTaxId}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {cust.firstName} {cust.lastName}
                          </td>
                          <td className="px-4 py-3 text-slate-600">{cust.email}</td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => {
                                onSelectCustomer(cust);
                                onClose();
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center gap-1 mx-auto transition-colors"
                            >
                              <CheckCircle className="h-3.5 w-3.5" />
                              Seleccionar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Block Pagination Controls */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
                <span>
                  Mostrando {customers.length} de {totalCount} clientes (Página {page} de {totalPages})
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    className="p-1.5 border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Create Customer Form */
            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="font-semibold text-slate-900">Registrar Nuevo Cliente</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Volver a búsqueda
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cédula / RUC * (Validado)
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={13}
                    value={newDni}
                    onChange={(e) => setNewDni(e.target.value)}
                    placeholder="1803928174"
                    className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="cliente@ejemplo.com"
                    className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Nombres * (Solo letras)
                  </label>
                  <input
                    type="text"
                    required
                    value={newFirstName}
                    onChange={(e) => setNewFirstName(e.target.value)}
                    placeholder="Juan Carlos"
                    className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Apellidos * (Solo letras)
                  </label>
                  <input
                    type="text"
                    required
                    value={newLastName}
                    onChange={(e) => setNewLastName(e.target.value)}
                    placeholder="Pérez Mendoza"
                    className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="0991234567"
                    className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    placeholder="Av. Cevallos y Montalvo, Ambato"
                    className="w-full px-3 py-1.5 border rounded text-sm focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 text-xs font-medium border rounded hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {creating ? "Guardando..." : "Guardar Cliente"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
