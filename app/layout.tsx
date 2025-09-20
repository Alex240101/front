import type React from "react"
import type { Metadata } from "next"
import { Space_Grotesk, DM_Sans } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "WhatsApp Reminders Pro",
  description: "Sistema profesional de recordatorios por WhatsApp para Perú",
  openGraph: {
    title: "WhatsApp Reminders Pro",
    description: "Sistema profesional de recordatorios por WhatsApp para Perú",
    url: "https://whatsapp-reminders.vercel.app",
    siteName: "WhatsApp Reminders Pro",
    images: [
      {
        url: "/icons/icon-512x512.jpg",
        width: 512,
        height: 512,
        alt: "WhatsApp Reminders Pro",
      },
    ],
    locale: "es_PE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WhatsApp Reminders Pro",
    description: "Sistema profesional de recordatorios por WhatsApp para Perú",
    images: ["/icons/icon-512x512.jpg"],
  },
  manifest: "/manifest.json",
  themeColor: "#00a884",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "WA Reminders",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/icon-192x192.jpg", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.jpg", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/icon-152x152.jpg", sizes: "152x152", type: "image/png" },
      { url: "/icons/icon-192x192.jpg", sizes: "192x192", type: "image/png" },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="application-name" content="WhatsApp Reminders Pro" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="WA Reminders" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#00a884" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="apple-touch-icon" href="/icons/icon-152x152.jpg" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.jpg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-192x192.jpg" />

        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-96x96.jpg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-72x72.jpg" />
        <link rel="mask-icon" href="/icons/icon-192x192.jpg" color="#00a884" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className={`${spaceGrotesk.variable} ${dmSans.variable} font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
