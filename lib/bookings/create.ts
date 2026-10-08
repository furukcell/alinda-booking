import type { Service } from "@/types/business";

export type CreateBookingInput = {
  businessId: string;
  service: Service;
  specialistId: string;
  customerName: string;
  customerPhone: string;
  date: string;
  time: string;
  whatsappOptIn: boolean;
  couponCode?: string;
};

export type CreatedBooking = {
  id: string;
  discount: number;
  totalPrice: number;
};

export async function createBooking(input: CreateBookingInput): Promise<CreatedBooking> {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      businessId: input.businessId,
      serviceId: input.service.id,
      specialistId: input.specialistId,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      date: input.date,
      time: input.time,
      whatsappOptIn: input.whatsappOptIn,
      couponCode: input.couponCode?.trim().toUpperCase() || ""
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Randevu oluşturulamadı.");
    if (response.status === 409) error.message = "SLOT_TAKEN";
    throw error;
  }

  return {
    id: data.referenceNo,
    discount: Number(data.discount || 0),
    totalPrice: Number(data.totalPrice ?? input.service.price)
  };
}
