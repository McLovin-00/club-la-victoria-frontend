import PublicRoute from "@/components/auth/public-route";
import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <PublicRoute>
      <main className="min-h-screen bg-background">
        <section className="mx-auto flex min-h-screen w-[95%] max-w-md items-center justify-center md:w-full">
          <div className="w-full">
            <div className="mb-8 flex flex-col items-center text-center">
              <Image
                alt="Logo"
                src="https://www.clublavictoria.com.ar/assets/logo-DGcyiAEh.webp"
                width={72}
                height={48}
                sizes="72px"
                className="mb-4"
                priority
              />
              <h1 className="page-title text-balance">Panel de Administracion</h1>
              <p className="page-description mt-2 text-balance">
                Gestion de socios y temporadas de pileta del club
              </p>
            </div>

            <LoginForm />
          </div>
        </section>
      </main>
    </PublicRoute>
  );
}
