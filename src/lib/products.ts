export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  emoji: string;
};

export const PRODUCTS: Product[] = [
  {
    id: "quantum-mug",
    name: "Quantum Mug",
    price: 24.99,
    description: "Keeps coffee hot through dimension shifts. Self-heating ceramic.",
    emoji: "☕",
  },
  {
    id: "neural-headphones",
    name: "Neural Headphones",
    price: 189.0,
    description: "Plays the music you were about to think of. ANC + precognition.",
    emoji: "🎧",
  },
  {
    id: "gravity-bottle",
    name: "Gravity Bottle",
    price: 34.5,
    description: "Water stays inside no matter which way is down. Zero-G tested.",
    emoji: "🥤",
  },
  {
    id: "photon-lamp",
    name: "Photon Lamp",
    price: 79.99,
    description: "Adjustable color temperature from candle to supernova. USB-C.",
    emoji: "💡",
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
