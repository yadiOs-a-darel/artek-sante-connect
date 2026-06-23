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

/** Orange RCA : préfixes 72, 73, 74 (Moov 70, Telecel 75, Nationlink 77) */
export const ORANGE_RCA_PHONE_REGEX = /^7[234]\d{6}$/;

export function isValidOrangePhone(phone: string): boolean {
  const normalized = normalizePhoneRCA(phone);
  return ORANGE_RCA_PHONE_REGEX.test(normalized);
}

export function formatCFA(amount: number): string {
  return new Intl.NumberFormat("fr-CF", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(amount);
}
