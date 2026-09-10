"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, FileText, Store } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-slate-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">FacturaWeb POS</h1>
              <p className="text-xs text-slate-400">UTA - Punto de Venta & Facturación</p>
            </div>
          </div>
          <nav className="flex space-x-2">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                pathname === "/"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Punto de Venta</span>
            </Link>
            <Link
              href="/invoices"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                pathname === "/invoices"
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Buscar / Ver Facturas</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
