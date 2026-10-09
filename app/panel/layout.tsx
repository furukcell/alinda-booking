import { AuthGuard } from "@/components/auth/auth-guard";
import { BookingToastListener } from "@/components/panel/booking-toast-listener";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <BookingToastListener />
      {children}
    </AuthGuard>
  );
}
