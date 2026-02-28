"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  BarChart3,
  Users,
  Calendar,
  UserCheck,
  LogOut,
  X,
  DollarSign,
  CalendarCheck,
  ChevronDown,
  Waves,
  Tags,
  FilePlus,
  CreditCard,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { authService } from "@/lib/api/auth";

// Tipos para la navegación agrupada
interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  items: NavItem[];
}

type NavigationEntry = NavItem | NavGroup;

// Estructura de navegación con grupos colapsables
const navigation: NavigationEntry[] = [
  { name: "Gestión de Socios", href: "/socios", icon: Users },
  {
    id: "pileta",
    label: "Gestión Pileta",
    icon: Waves,
    items: [
      { name: "Temporadas", href: "/temporadas", icon: Calendar },
      { name: "Asociaciones", href: "/socios-temporadas", icon: UserCheck },
      { name: "Estadísticas", href: "/estadisticas", icon: BarChart3 },
    ],
  },
  {
    id: "cuotas",
    label: "Cuotas",
    icon: DollarSign,
    items: [
      { name: "Categorías", href: "/cobros/categorias", icon: Tags },
      { name: "Generar cuotas", href: "/cobros/generar", icon: FilePlus },
      { name: "Registrar pagos", href: "/cobros/pagos", icon: CreditCard },
      { name: "Estado de pagos", href: "/cobros/estado-pagos", icon: CalendarCheck },
      { name: "Reportes", href: "/cobros/reportes", icon: FileText },
    ],
  },
];

// Type guard para distinguir grupos de items individuales
function isNavGroup(entry: NavigationEntry): entry is NavGroup {
  return "items" in entry;
}

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(["pileta", "cuotas"]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleLogout = () => {
    authService.logout();
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <Image
            alt="Logo"
            src="https://www.clublavictoria.com.ar/assets/logo-DGcyiAEh.webp"
            width={32}
            height={32}
          />
          <div>
            <h2 className="font-semibold text-sidebar-foreground">
              Club La Victoria
            </h2>
            <p className="text-xs text-muted-foreground">Panel de Control</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden text-sidebar-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((entry) => {
          if (isNavGroup(entry)) {
            const isOpen = expandedGroups.includes(entry.id);

            return (
              <Collapsible
                key={entry.id}
                open={isOpen}
                onOpenChange={() => toggleGroup(entry.id)}
              >
                <CollapsibleTrigger className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground">
                  <entry.icon className="h-4 w-4" />
                  {entry.label}
                  <ChevronDown
                    className={cn(
                      "ml-auto h-4 w-4 transition-transform duration-200",
                      isOpen && "rotate-180"
                    )}
                  />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-1 space-y-1 pl-4">
                    {entry.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                            isActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          )}
                          onClick={onClose}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.name}
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          }

          // Item individual (standalone)
          const isActive = pathname === entry.href;
          return (
            <Link
              key={entry.href}
              href={entry.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              onClick={onClose}
            >
              <entry.icon className="h-4 w-4" />
              {entry.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full grid grid-cols-3 text-white text-center bg-sidebar-primary hover:bg-sidebar-primary/85 hover:scale-105 hover:text-sidebar-primary-foreground"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  );
}
