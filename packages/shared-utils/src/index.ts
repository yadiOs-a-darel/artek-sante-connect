/** Normalise un numéro Orange RCA (+236) */
export function normalizePhoneRCA(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("236")) return digits.slice(3);
  return digits;
}

export function formatPhoneRCA(phone: string): string {
  const normalized = normalizePhoneRCA(phone);
  return `+236 ${normalized}`;
}

export function isValidOrangePhone(phone: string): boolean {
  const normalized = normalizePhoneRCA(phone);
  return /^7\d{7}$/.test(normalized);
}

export function formatCFA(amount: number): string {
  return new Intl.NumberFormat("fr-CF", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(amount);
}
