import type { Metadata, Viewport } from "next";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { Fredoka } from "next/font/google";
import { LocationProvider } from "@/lib/LocationProvider";
import { ConvexClientProvider } from "./ConvexClientProvider";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SocialWave — surf forecasts, verified by surfers 🦀",
  description:
    "Forecasts predict, surfers verify. SocialWave combines Open-Meteo marine forecasts with real surfer reports so you always know if it's worth going.",
  applicationName: "SocialWave",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SocialWave",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
  },
  openGraph: {
    title: "SocialWave 🦀",
    description: "Forecasts predict. Surfers verify.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#7DD3FC",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${fredoka.variable} h-full antialiased`}>
      <body
        className="min-h-full bg-white text-slate-900 flex flex-col"
        suppressHydrationWarning
      >
        <ConvexAuthNextjsServerProvider
          verbose={process.env.CONVEX_AUTH_VERBOSE === "1"}
        >
          <ConvexClientProvider>
            <LocationProvider>{children}</LocationProvider>
          </ConvexClientProvider>
        </ConvexAuthNextjsServerProvider>
      </body>
    </html>
  );
}
