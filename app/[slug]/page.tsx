import { notFound } from "next/navigation";
import { BusinessBooking } from "@/components/booking/business-booking";
import { businesses, getBusinessBySlug } from "@/lib/mock/businesses";

export function generateStaticParams() {
  return businesses.map((business) => ({ slug: business.slug }));
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = getBusinessBySlug(slug);

  if (!business) notFound();

  return <BusinessBooking business={business} />;
}
