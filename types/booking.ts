export type BookingStatus = "confirmed" | "cancelled";

export type Booking = {
  id: string;
  businessId: string;
  referenceNo: string;
  serviceId: string;
  serviceName: string;
  serviceDurationMinutes: number;
  servicePrice: number;
  specialistId: string;
  specialistName: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  status: BookingStatus;
  whatsappOptIn?: boolean;
  createdAt?: unknown;
};
