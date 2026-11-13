export type CategoryId = "makanan-minuman" | "kemasan" | "kebutuhan-kantor" | "tekstil-seragam";

export type Category = {
  id: CategoryId;
  name: string;
  description: string;
  tagline: string;
};

export type PriceTier = {
  /** Jumlah minimum (inklusif) agar harga tier berlaku. */
  min: number;
  price: number;
};

export type Spec = { label: string; value: string };

export type Variant = { name: string; options: string[] };

export type Review = {
  author: string;
  role: string;
  rating: number;
  date: string;
  text: string;
};

export type Faq = { q: string; a: string };

export type Product = {
  slug: string;
  name: string;
  category: CategoryId;
  supplierSlug: string;
  image: string;
  badge?: string;
  tagline: string;
  description: string[];
  highlights: string[];
  specs: Spec[];
  unit: string;
  moq: number;
  priceTiers: PriceTier[];
  leadTimeDays: [number, number];
  monthlyCapacity: string;
  origin: string;
  certifications: string[];
  variants: Variant[];
  packaging: string;
  shipping: string[];
  paymentTerms: string[];
  sample: { available: boolean; price?: number; note: string };
  customizable: boolean;
  customOptions?: string[];
  rating: number;
  reviewCount: number;
  soldCount: number;
  tags: string[];
  reviews: Review[];
  faq: Faq[];
};

export type Supplier = {
  slug: string;
  name: string;
  initials: string;
  city: string;
  province: string;
  category: CategoryId;
  established: number;
  employees: string;
  verified: boolean;
  rating: number;
  responseRate: number;
  responseTime: string;
  onTimeDelivery: number;
  tagline: string;
  about: string[];
  capabilities: string[];
  certifications: string[];
  mainMarkets: string[];
  productionCapacity: string;
  gradient: string;
};
