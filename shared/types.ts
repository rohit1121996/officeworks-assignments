export type Product = {
  id: string;
  title: string;
  description: string;
  categorySlug: string;
  categoryName: string;
  price: number;
  currency: "USD";
  imageUrl: string;
  rating?: number;
};

export type Category = { slug: string; name: string };
export type HomeResponse = { categories: Category[]; topRated: Product[] };
export type CategoryResponse = {
  category: Category;
  topRated: Product[];
  additional: Product[];
};
export type Enquiry = {
  productId: string;
  name: string;
  email: string;
  phone?: string;
  message?: string;
};
