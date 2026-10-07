import type { Business } from "@/types/business";

export const businesses: Business[] = [
  {
    id: "business_meltem_beauty",
    name: "Meltem Beauty Studio",
    slug: "meltem-guzellik",
    category: "Güzellik & Bakım",
    description: "Profesyonel güzellik ve bakım hizmetleri.",
    city: "Muğla",
    district: "Bodrum",
    address: "Bodrum, Muğla",
    phone: "0555 000 00 01",
    initials: "MB",
    primaryColor: "#B86F61",
    primaryColorSoft: "#F3E4E0",
    services: [
      { id: "signature-sac-kesimi", name: "Signature Saç Kesimi", description: "Kesim + şekillendirme", durationMinutes: 45, price: 600, currency: "TRY" },
      { id: "hydra-cilt-bakimi", name: "Hydra Cilt Bakımı", description: "Derin temizlik + nemlendirme", durationMinutes: 60, price: 900, currency: "TRY" },
      { id: "manikur", name: "Manikür", description: "Klasik manikür", durationMinutes: 35, price: 450, currency: "TRY" }
    ],
    specialists: [
      { id: "demo-aylin", name: "Aylin", title: "Saç & Stil Uzmanı", photoUrl: "https://i.pravatar.cc/240?img=47", serviceIds: ["signature-sac-kesimi"] },
      { id: "demo-melisa", name: "Melisa", title: "Cilt Bakım Uzmanı", photoUrl: "https://i.pravatar.cc/240?img=32", serviceIds: ["hydra-cilt-bakimi"] },
      { id: "demo-derya", name: "Derya", title: "Nail Artist", photoUrl: "https://i.pravatar.cc/240?img=44", serviceIds: ["manikur"] }
    ]
  },
  {
    id: "business_ahmet_barber",
    name: "Ahmet Barber",
    slug: "ahmet-berber",
    category: "Berber",
    description: "Klasik ve modern erkek bakım hizmetleri.",
    city: "Ankara",
    district: "Çankaya",
    address: "Çankaya, Ankara",
    phone: "0555 000 00 02",
    initials: "AB",
    primaryColor: "#5D6B5A",
    primaryColorSoft: "#E8EDE7",
    services: [
      { id: "sac-sakal", name: "Saç + Sakal", description: "Kesim, şekillendirme ve sakal", durationMinutes: 60, price: 550, currency: "TRY" },
      { id: "sac-kesimi", name: "Saç Kesimi", description: "Modern kesim ve şekillendirme", durationMinutes: 40, price: 400, currency: "TRY" },
      { id: "sakal", name: "Sakal Tasarımı", description: "Şekillendirme ve bakım", durationMinutes: 25, price: 250, currency: "TRY" }
    ]
  }
];

export function getBusinessBySlug(slug: string) {
  return businesses.find((business) => business.slug === slug);
}
