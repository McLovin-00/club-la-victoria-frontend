import PublicRoute from "@/components/auth/public-route";
import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <PublicRoute>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-[95%] md:w-full max-w-md">
          {/* Club Logo */}
          <div className="text-center mb-8 flex flex-col items-center">
            <Image
              alt="Logo"
              src="https://clublavictoria.com.ar/static/media/logo.6dafc533b0491900e9a6.png"
              width={72}
              height={48}
              className="mb-4"
            />
            <h1 className="text-2xl font-bold text-foreground">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground mt-2">
              Gestión de Socios y temporadas de piletas del Club
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </PublicRoute>
  );
}
