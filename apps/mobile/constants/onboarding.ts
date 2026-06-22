import { colors } from "./theme";

export interface OnboardingSlide {
  id: string;
  icon: "heart" | "videocam" | "location" | "shield";
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}

export const ONBOARDING_SLIDES: OnboardingSlide[] = [
  {
    id: "welcome",
    icon: "heart",
    iconColor: "#fff",
    iconBg: colors.green,
    title: "Bienvenue sur ARTEK Connect Santé",
    description:
      "La télémédecine solaire au service des communautés de la République Centrafricaine.",
  },
  {
    id: "consultation",
    icon: "videocam",
    iconColor: "#fff",
    iconBg: colors.blue,
    title: "Consultez un médecin à distance",
    description:
      "Prenez rendez-vous et rejoignez une visioconférence Google Meet depuis votre téléphone.",
  },
  {
    id: "kiosque",
    icon: "location",
    iconColor: "#fff",
    iconBg: colors.orange,
    title: "Kiosques ASC dans les villages",
    description:
      "Les agents de santé communautaire prennent vos constantes et vous orientent vers un médecin.",
  },
  {
    id: "privacy",
    icon: "shield",
    iconColor: "#fff",
    iconBg: "#7C3AED",
    title: "Vos données sont protégées",
    description:
      "Dossier médical chiffré, accès sécurisé par OTP et conformité aux bonnes pratiques de santé.",
  },
];
