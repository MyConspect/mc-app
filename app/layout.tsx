import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ResourcesAutoRefresh } from "@/components/dev/ResourcesAutoRefresh";
import { ConceptHashBootScript } from "@/components/nav/ConceptHashBootScript";
import { ThemeBootScript } from "@/components/nav/ThemeBootScript";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import "./globals.css";

/* Font preview: … → Manrope → Inter */
const handbookSans = Inter({
  variable: "--font-geist-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "cyrillic"],
});

const handbookMono = JetBrains_Mono({
  variable: "--font-geist-mono",
  weight: ["400", "500", "600"],
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: {
    default: SITE_NAME,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-concept-depth="quick"
      suppressHydrationWarning
      className={`${handbookSans.variable} ${handbookMono.variable} h-full overflow-hidden antialiased`}
    >
      <head>
        <ThemeBootScript />
        <ConceptHashBootScript />
      </head>
      <body className="h-full overflow-hidden bg-background font-sans text-foreground">
        <ResourcesAutoRefresh />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
