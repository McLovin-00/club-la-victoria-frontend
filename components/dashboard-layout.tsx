"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { NotificacionesBell } from "@/components/notificaciones/NotificacionesBell"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/30 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 border-r border-sidebar-border bg-sidebar
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
        aria-label="Menu lateral"
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </aside>

      <div className="ml-0 lg:ml-64">
        <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
          <div className="page-shell lg:hidden flex items-center justify-between py-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="text-foreground"
              aria-label="Abrir menu lateral"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="font-semibold tracking-tight text-foreground">Panel de Administracion</h2>
            <NotificacionesBell />
          </div>

          <div className="page-shell hidden items-center justify-end py-4 lg:flex">
            <NotificacionesBell />
          </div>
        </header>

        <main className="page-shell py-6 lg:py-8" aria-live="polite">
          {children}
        </main>
      </div>
    </div>
  )
}
