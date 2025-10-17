"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Image
            src="https://clublavictoria.com.ar/static/media/logo.6dafc533b0491900e9a6.png"
            alt="Club La Victoria Logo"
            width={120}
            height={80}
            className="object-contain"
          />
        </div>

        {/* Error Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-primary">404</h1>
            <h2 className="text-2xl font-semibold text-foreground">
              Página no encontrada
            </h2>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Lo sentimos, la página que estás buscando no existe o ha sido movida.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground">
              <Home className="h-4 w-4 mr-2" />
              Ir al inicio
            </Button>
          </Link>
          <Button 
            variant="outline" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver atrás
          </Button>
        </div>

        {/* Additional Help */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">
            ¿Necesitas ayuda? Puedes:
          </p>
          <div className="space-y-2 text-sm">
            <Link 
              href="/socios" 
              className="block text-primary hover:text-primary/80 transition-colors"
            >
              • Ver lista de socios
            </Link>
            <Link 
              href="/temporadas" 
              className="block text-primary hover:text-primary/80 transition-colors"
            >
              • Gestionar temporadas
            </Link>
            <Link 
              href="/estadisticas" 
              className="block text-primary hover:text-primary/80 transition-colors"
            >
              • Ver estadísticas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
