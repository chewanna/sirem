'use client'

import { useState } from 'react';
import { Search, Briefcase, ArrowRightLeft, UserPlus, FileText, Settings, ChevronLeft, ChevronRight, Inbox, Bot } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import Link from "next/link"

const Lateral = () => {

  const menuItems = [
    { id: "busqueda", label: "Búsqueda", href: "/busqueda", icon: Search },
    { id: "cargos", label: "Cargos", href: "/cargos", icon: Briefcase },
    { id: "movimientos", label: "Movimientos", href: "/movimientos", icon: ArrowRightLeft },
    { id: "familiares", label: "Familiares", href: "/familiares", icon: UserPlus },
    { id: "listados", label: "Listados", href: "/listados", icon: FileText },
    { id: "settings", label: "Configuración", href: "/configuracion", icon: Settings },
    { id: "ia", label: "IA", href: "/ia", icon: Bot },
  ];

  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname()

  return (
    <aside
      className={`${collapsed ? 'w-20' : 'w-64'
        } bg-[var(--surface)] transition-all duration-300 flex flex-col h-screen sticky top-0`}
    >
      {/* Header */}
      <div className="p-6 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <video src="/s.mp4" width={32} height={32} autoPlay loop muted />
            </div>
            <div>
              <h2 className="font-semibold text-[var(--text-primary)]">DEFENSA</h2>
              <p className="text-xs text-[var(--text-secondary)]">S-1 (R.H.) E.M.C.D.N.</p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 hover:bg-[var(--surface-alt)] rounded-lg transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 text-[var(--text-secondary)]" />
          ) : (
            <ChevronLeft className="w-5 h-5 text-[var(--text-secondary)]" />
          )}
        </button>
      </div>

      {/* navegacion     */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                isActive
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-alt)] hover:text-[var(--text-primary)]"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}

      </nav>
    </aside>
  )
}

export default Lateral
