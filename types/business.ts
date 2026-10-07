export type Service = {
  id: string;
  name: string;
  description: string;
  durationMinutes: number;
  price: number;
  currency: "TRY";
};

export type Specialist = {
  id: string;
  name: string;
  title: string;
  photoUrl: string;
  serviceIds: string[];
};

export type Business = {
  id: string;
  name: string;
  slug: string;
  category: string;
  description: string;
  city: string;
  district: string;
  address: string;
  phone: string;
  initials: string;
  primaryColor: string;
  primaryColorSoft: string;
  services: Service[];
  specialists: Specialist[];
};
