"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContadorNotificaciones } from "@/hooks/api/notificaciones/useContadorNotificaciones";
import { useNotificaciones, Notificacion } from "@/hooks/api/notificaciones/useNotificaciones";
import { useMarcarLeida } from "@/hooks/api/notificaciones/useMarcarLeida";
import { useMarcarTodasLeidas } from "@/hooks/api/notificaciones/useMarcarTodasLeidas";
import { cn } from "@/lib/utils";

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin}m`;
  if (diffHrs < 24) return `Hace ${diffHrs}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return date.toLocaleDateString("es-AR");
}

export function NotificacionesBell() {
  const { data: contador } = useContadorNotificaciones();
  const { data: notificacionesData } = useNotificaciones();
  const marcarLeida = useMarcarLeida();
  const marcarTodasLeidas = useMarcarTodasLeidas();

  const totalNoLeidas = contador?.totalNoLeidas ?? 0;
  const notificaciones = notificacionesData?.notificaciones ?? [];

  const handleMarcarLeida = (notificacion: Notificacion) => {
    if (!notificacion.leida) {
      marcarLeida.mutate(notificacion.id);
    }
  };

  const handleMarcarTodasLeidas = () => {
    marcarTodasLeidas.mutate();
  };

  const badgeText = totalNoLeidas >= 10 ? "9+" : String(totalNoLeidas);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {totalNoLeidas > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
              {badgeText}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="text-sm font-semibold">Notificaciones</h4>
          {totalNoLeidas > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleMarcarTodasLeidas}
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {notificaciones.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No hay notificaciones
            </div>
          ) : (
            <div className="divide-y">
              {notificaciones.map((notificacion) => (
                <button
                  key={notificacion.id}
                  type="button"
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-muted/50 transition-colors",
                    !notificacion.leida && "bg-blue-50/50"
                  )}
                  onClick={() => handleMarcarLeida(notificacion)}
                >
                  <div className="flex items-start gap-2">
                    {!notificacion.leida && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600" />
                    )}
                    <div className={cn("flex-1", notificacion.leida && "ml-4")}>
                      <p className="text-sm">{notificacion.mensaje}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatTimeAgo(notificacion.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
