export type BookingStatus = "pending" | "confirmed" | "cancelled";

export type Booking = {
  id: string;
  businessId: string;
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
  createdAt?: unknown;
};
