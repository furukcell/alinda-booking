import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BusinessBooking } from "@/components/booking/business-booking";
import { businesses } from "@/lib/mock/businesses";
import { getPublicBusiness } from "@/lib/businesses/public";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return businesses.map((business) => ({ slug: business.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const business = await getPublicBusiness(slug);

  return {
    title: business ? `${business.name} · Online Randevu | ALINDA` : "Online Randevu | ALINDA",
    description: business ? `${business.name} için online randevu oluşturun.` : "ALINDA ile online randevu oluşturun.",
    manifest: `/${slug}/manifest.webmanifest`,
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: business?.name ?? "ALINDA"
    }
  };
}

export default async function BusinessPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await getPublicBusiness(slug);

  if (!business) notFound();

  return <BusinessBooking business={business} />;
}
