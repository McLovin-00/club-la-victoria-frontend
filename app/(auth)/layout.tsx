import ProtectedRoute from "@/components/auth/protected-route";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
