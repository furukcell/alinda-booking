import { AuthGuard } from "@/components/auth/auth-guard";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
