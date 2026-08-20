export type Product = {
  id: string;
  name: string;
  price: number;
  description: string;
  emoji: string;
  sketchfabModelId: string;
  features: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "quantum-mug",
    name: "Quantum Mug",
    price: 24.99,
    description: "Keeps coffee hot through dimension shifts. Self-heating ceramic.",
    emoji: "☕",
    sketchfabModelId: "6881f87bef1a4e9db61fdd0a7030b9cf",
    features: [
      "Self-heating ceramic",
      "Dimension-shift resistant",
      "Quantum insulation layer",
      "Dishwasher safe (most dimensions)",
      "Made on Earth",
    ],
  },
  {
    id: "neural-headphones",
    name: "Neural Headphones",
    price: 189.0,
    description: "Plays the music you were about to think of. ANC + precognition.",
    emoji: "🎧",
    sketchfabModelId: "e07049beeff949da853f314d50531bef",
    features: [
      "Active noise cancellation",
      "Precognitive track selection",
      "Neural lace interface",
      "40-hour battery (subjective time)",
      "Made on Earth",
    ],
  },
  {
    id: "gravity-bottle",
    name: "Gravity Bottle",
    price: 34.5,
    description: "Water stays inside no matter which way is down. Zero-G tested.",
    emoji: "🥤",
    sketchfabModelId: "cf5dca2a57aa4f849e53739762f048fc",
    features: [
      "Zero-G sealed valve",
      "Insulated for 12 hours",
      "Titanium alloy shell",
      "Fits any cup holder (any dimension)",
      "Made on Earth",
    ],
  },
  {
    id: "photon-lamp",
    name: "Photon Lamp",
    price: 79.99,
    description: "Adjustable color temperature from candle to supernova. USB-C.",
    emoji: "💡",
    sketchfabModelId: "b9458e04d30e4b6284d46d35880a9b95",
    features: [
      "Color temp: candle to supernova",
      "USB-C fast charge",
      "Adjustable photon beam angle",
      "Aluminum chassis",
      "Made on Earth",
    ],
  },
];

export function getProduct(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
