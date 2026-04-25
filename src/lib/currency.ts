import type { Currency } from "@/types";

// Approximate FX rates from INR. In production, fetch live rates daily.
const RATE_FROM_INR: Record<Currency, number> = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0095,
  AED: 0.044,
  CAD: 0.016,
  AUD: 0.018,
  SGD: 0.016,
};

const SYMBOL: Record<Currency, string> = {
  INR: "₹",
  USD: "$",
  GBP: "£",
  AED: "AED ",
  CAD: "C$",
  AUD: "A$",
  SGD: "S$",
};

export function convertFromInr(inr: number, currency: Currency): number {
  return inr * RATE_FROM_INR[currency];
}

export function formatPrice(inr: number, currency: Currency = "INR"): string {
  const value = convertFromInr(inr, currency);
  if (currency === "INR") {
    return `${SYMBOL.INR}${Math.round(value).toLocaleString("en-IN")}`;
  }
  return `${SYMBOL[currency]}${value.toFixed(2)}`;
}

export const SUPPORTED_CURRENCIES: Currency[] = [
  "INR",
  "USD",
  "GBP",
  "AED",
  "CAD",
  "AUD",
  "SGD",
];
