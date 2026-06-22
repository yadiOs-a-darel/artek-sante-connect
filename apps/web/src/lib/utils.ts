import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPhone(phone: string): string {
  return `+236 ${phone}`;
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("fr-CF", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}
