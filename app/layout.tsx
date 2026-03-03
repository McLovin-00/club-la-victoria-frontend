import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { TanstackProvider } from "@/providers/auth-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Sistema de Ingresos - Club La Victoria",
  description: "Sistema de gestión de ingresos para el Club La Victoria",
  icons:
    "https://clublavictoria.com.ar/static/media/logo.6dafc533b0491900e9a6.png",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        suppressHydrationWarning
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
      >
        <TanstackProvider>
          <a href="#main-content" className="skip-link">
            Saltar al contenido principal
          </a>
          <div id="main-content">{children}</div>
          <Toaster
            position="top-center"
            duration={3000}
            richColors
            toastOptions={{}}
          />
        </TanstackProvider>
      </body>
    </html>
  );
}
