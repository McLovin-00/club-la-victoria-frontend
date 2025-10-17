"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Calendar, UserCheck, LogOut, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { authService } from "@/lib/api/auth";

interface SidebarProps {
  onClose?: () => void;
}

const navigation = [
  { name: "Gestión de Socios", href: "/socios", icon: Users },
  { name: "Temporadas", href: "/temporadas", icon: Calendar },
  { name: "Asociaciones", href: "/socios-temporadas", icon: UserCheck },
  { name: "Estadísticas", href: "/estadisticas", icon: BarChart3 },
];

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

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
            src="https://clublavictoria.com.ar/static/media/logo.6dafc533b0491900e9a6.png"
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
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
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
