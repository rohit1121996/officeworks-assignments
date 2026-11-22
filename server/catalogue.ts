import type {
  Category,
  CategoryResponse,
  HomeResponse,
  Product,
} from "../shared/types.js";

const categories: Category[] = [
  { slug: "technology", name: "Technology" },
  { slug: "home", name: "Home" },
  { slug: "outdoors", name: "Outdoors" },
  { slug: "studio", name: "Studio" },
];

const products: Product[] = [
  {
    id: "t1",
    title: "Arc Wireless Headphones",
    description:
      "Comfortable over-ear headphones with balanced sound and a fold-flat design.",
    categorySlug: "technology",
    categoryName: "Technology",
    price: 129,
    currency: "USD",
    imageUrl: "/products/technology.svg",
    rating: 4.8,
  },
  {
    id: "t2",
    title: "Orbit Desk Lamp",
    description:
      "An adjustable LED lamp with warm and cool light for focused work.",
    categorySlug: "technology",
    categoryName: "Technology",
    price: 69,
    currency: "USD",
    imageUrl: "/products/technology.svg",
    rating: 4.7,
  },
  {
    id: "t3",
    title: "Pocket Bluetooth Speaker",
    description: "Portable sound in a compact, splash-resistant enclosure.",
    categorySlug: "technology",
    categoryName: "Technology",
    price: 49,
    currency: "USD",
    imageUrl: "/products/technology.svg",
    rating: 4.4,
  },
  {
    id: "h1",
    title: "Solstice Ceramic Vase",
    description: "A hand-finished stoneware vase with a soft matte glaze.",
    categorySlug: "home",
    categoryName: "Home",
    price: 45,
    currency: "USD",
    imageUrl: "/products/home.svg",
    rating: 4.9,
  },
  {
    id: "h2",
    title: "Linen Table Runner",
    description: "Textured everyday linen for a relaxed dining table.",
    categorySlug: "home",
    categoryName: "Home",
    price: 38,
    currency: "USD",
    imageUrl: "/products/home.svg",
    rating: 4.6,
  },
  {
    id: "h3",
    title: "Amber Glass Tumbler Set",
    description: "Four stackable tumblers with a warm amber tint.",
    categorySlug: "home",
    categoryName: "Home",
    price: 32,
    currency: "USD",
    imageUrl: "/products/home.svg",
    rating: 4.5,
  },
  {
    id: "o1",
    title: "Summit Daypack",
    description: "A lightweight 18-litre pack for trails and city days.",
    categorySlug: "outdoors",
    categoryName: "Outdoors",
    price: 89,
    currency: "USD",
    imageUrl: "/products/outdoors.svg",
    rating: 4.8,
  },
  {
    id: "o2",
    title: "Trail Steel Bottle",
    description:
      "Double-wall insulated bottle that keeps drinks cool on the move.",
    categorySlug: "outdoors",
    categoryName: "Outdoors",
    price: 34,
    currency: "USD",
    imageUrl: "/products/outdoors.svg",
    rating: 4.6,
  },
  {
    id: "o3",
    title: "Camp Fold Stool",
    description: "Compact foldaway seating with a durable canvas top.",
    categorySlug: "outdoors",
    categoryName: "Outdoors",
    price: 56,
    currency: "USD",
    imageUrl: "/products/outdoors.svg",
    rating: 4.3,
  },
  {
    id: "s1",
    title: "Studio Sketchbook",
    description: "Heavyweight uncoated pages ready for pencil, ink and ideas.",
    categorySlug: "studio",
    categoryName: "Studio",
    price: 24,
    currency: "USD",
    imageUrl: "/products/studio.svg",
    rating: 4.9,
  },
  {
    id: "s2",
    title: "Brush Roll Set",
    description: "A curated set of versatile brushes in a cotton canvas roll.",
    categorySlug: "studio",
    categoryName: "Studio",
    price: 52,
    currency: "USD",
    imageUrl: "/products/studio.svg",
    rating: 4.7,
  },
  {
    id: "s3",
    title: "Porcelain Palette",
    description: "An easy-clean mixing palette with generous wells.",
    categorySlug: "studio",
    categoryName: "Studio",
    price: 29,
    currency: "USD",
    imageUrl: "/products/studio.svg",
    rating: 4.5,
  },
];

// The entrepreneur's editorial choices; not automatically derived from ratings.
export const topRatedIds = ["t1", "t2", "h1", "o1", "s1"];
const topRated = new Set(topRatedIds);

export class Catalogue {
  home(): HomeResponse {
    return { categories, topRated: topRatedIds.map((id) => this.product(id)!) };
  }

  category(slug: string): CategoryResponse | undefined {
    const category = categories.find((item) => item.slug === slug);
    if (!category) return undefined;
    const matches = products.filter((item) => item.categorySlug === slug);
    return {
      category,
      topRated: matches.filter((item) => topRated.has(item.id)),
      additional: matches.filter((item) => !topRated.has(item.id)),
    };
  }

  search(query: string): Product[] {
    const term = query.trim().toLocaleLowerCase();
    if (!term) return [];
    return products.filter((item) =>
      [item.title, item.description, item.categoryName].some((value) =>
        value.toLocaleLowerCase().includes(term),
      ),
    );
  }

  product(id: string): Product | undefined {
    return products.find((item) => item.id === id);
  }
}
