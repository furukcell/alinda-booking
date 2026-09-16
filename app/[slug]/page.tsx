import { notFound } from "next/navigation";
import { BusinessBooking } from "@/components/booking/business-booking";
import { businesses } from "@/lib/mock/businesses";
import { getPublicBusiness } from "@/lib/businesses/public";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return businesses.map((business) => ({ slug: business.slug }));
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getPublicBusiness(slug);

  if (!business) notFound();

  return <BusinessBooking business={business} />;
}
