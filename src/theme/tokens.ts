/**
 * "Midnight Teal" design tokens.
 *
 * A slate base with a teal accent, plus one colour per reminder status so a
 * state is never shown by colour alone (always pair with text/an icon).
 * Light is the V1 baseline; dark follows the same structure.
 */

export type ColorScheme = "light" | "dark";

export interface ColorTokens {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textOnPrimary: string;

  primary: string;
  primaryPressed: string;
  primaryTint: string;

  statusUpcoming: string;
  statusDueSoon: string;
  statusOverdue: string;
  statusDone: string;
  statusSnoozed: string;

  overlay: string;
}

const light: ColorTokens = {
  background: "#F8FAFC",
  surface: "#FFFFFF",
  surfaceAlt: "#F1F5F9",
  border: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#475569",
  textOnPrimary: "#FFFFFF",

  primary: "#0F766E",
  primaryPressed: "#115E59",
  primaryTint: "#CCFBF1",

  statusUpcoming: "#2563EB",
  statusDueSoon: "#B45309",
  statusOverdue: "#DC2626",
  statusDone: "#15803D",
  statusSnoozed: "#7C3AED",

  overlay: "rgba(15, 23, 42, 0.4)",
};

const dark: ColorTokens = {
  background: "#0B1120",
  surface: "#111827",
  surfaceAlt: "#1A2333",
  border: "#1F2937",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  textOnPrimary: "#05221F",

  primary: "#2DD4BF",
  primaryPressed: "#14B8A6",
  primaryTint: "#134E4A",

  statusUpcoming: "#60A5FA",
  statusDueSoon: "#FBBF24",
  statusOverdue: "#F87171",
  statusDone: "#4ADE80",
  statusSnoozed: "#A78BFA",

  overlay: "rgba(0, 0, 0, 0.55)",
};

export const palettes: Record<ColorScheme, ColorTokens> = { light, dark };

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  fontFamily: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
  },
  size: {
    xs: 13,
    sm: 15,
    md: 17,
    lg: 22,
    xl: 28,
  },
} as const;

export const shadow = {
  card: {
    shadowColor: "#0F172A",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
} as const;

export const touchTarget = 44;
