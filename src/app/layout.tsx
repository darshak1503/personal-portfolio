import type { Metadata } from "next";
import { Geist, Geist_Mono, Unbounded } from "next/font/google";
import "./globals.css";
import { getProfile, getSiteConfig } from "@/lib/content";
import { buildPersonJsonLd } from "@/lib/seo";
import { DockNav } from "@/components/layout/dock-nav";
import { TopBar } from "@/components/layout/top-bar";
import { Footer } from "@/components/layout/footer";
import { SiteShell } from "@/components/providers/site-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const profile = getProfile();
const config = getSiteConfig();

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: config.siteName,
    template: `%s | ${profile.name}`,
  },
  description: config.description,
  keywords: config.keywords,
  alternates: { canonical: config.siteUrl },
  openGraph: {
    type: "website",
    url: config.siteUrl,
    title: config.siteName,
    description: config.description,
    images: [{ url: config.ogImage }],
  },
  twitter: {
    card: "summary_large_image",
    title: config.siteName,
    description: config.description,
    images: [config.ogImage],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = buildPersonJsonLd(profile, config);

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${unbounded.variable} h-full`}
    >
      <body className="min-h-full overflow-x-hidden antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteShell>
          <TopBar profile={profile} config={config} />
          <DockNav />
          {children}
          <Footer profile={profile} config={config} />
        </SiteShell>
      </body>
    </html>
  );
}