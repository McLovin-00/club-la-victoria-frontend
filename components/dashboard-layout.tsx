"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { NotificacionesBell } from "@/components/notificaciones/NotificacionesBell"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border/70 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75 px-4">
          <SidebarTrigger className="-ml-1 md:hidden" />
          <Separator orientation="vertical" className="mr-2 h-4 md:hidden" />
          <h2 className="font-semibold tracking-tight text-foreground flex-1 md:hidden">
            Panel de Administracion
          </h2>
          <div className="flex-1 hidden md:block" />
          <NotificacionesBell />
        </header>

        <main className="page-shell py-6 lg:py-8" aria-live="polite">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
