import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimasi loading font
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FileVault Pro - Professional File Upload Service",
  description: "Secure, fast, and reliable file upload service with enterprise-grade features. Upload files with password protection, expiration dates, and advanced sharing options.",
  keywords: ["file upload", "secure sharing", "file storage", "cloud storage", "file transfer"],
  authors: [{ name: "FileVault Team" }],
  creator: "FileVault Pro",
  publisher: "FileVault Pro",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://filevault-pro.com",
    siteName: "FileVault Pro",
    title: "FileVault Pro - Professional File Upload Service",
    description: "Secure, fast, and reliable file upload service with enterprise-grade features.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FileVault Pro - Professional File Upload Service",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FileVault Pro - Professional File Upload Service",
    description: "Secure, fast, and reliable file upload service with enterprise-grade features.",
    creator: "@filevaultpro",
    images: ["/og-image.jpg"],
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#3b82f6",
      },
    ],
  },
  alternates: {
    canonical: "https://filevault-pro.com",
    languages: {
      "id-ID": "https://filevault-pro.com",
      "en-US": "https://filevault-pro.com/en",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Preconnect untuk optimasi loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        
        {/* DNS Prefetch untuk external resources */}
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
        
        {/* Security Headers via meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* Performance hints */}
        <link rel="preload" href="/fonts/geist-sans.woff2" as="font" type="font/woff2" crossOrigin="" />
        
        {/* Progressive Web App support */}
        <meta name="application-name" content="FileVault Pro" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FileVault Pro" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "FileVault Pro",
              "description": "Professional file upload service with enterprise-grade security features",
              "applicationCategory": "Utility",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "publisher": {
                "@type": "Organization",
                "name": "FileVault Pro"
              }
            })
          }}
        />
        
        {/* Google Analytics (ganti dengan tracking ID Anda) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'GA_MEASUREMENT_ID', {
                page_title: document.title,
                page_location: window.location.href,
              });
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground selection:bg-primary/20 selection:text-primary-foreground`}
        suppressHydrationWarning
      >
        {/* Skip to main content untuk aksesibilitas */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          Skip to main content
        </a>
        
        {/* Loading indicator */}
        <div id="loading-indicator" className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform -translate-y-full transition-transform duration-300 z-50"></div>
        
        {/* Toast container untuk notifikasi */}
        <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
          {/* Toasts akan dirender di sini */}
        </div>
        
        {/* Main content */}
        <main id="main-content" className="relative">
          {children}
        </main>
        
        {/* Service Worker registration */}
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
        
        {/* Dark mode script to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme') || 
                    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        
        {/* Performance observer untuk monitoring */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('PerformanceObserver' in window) {
                const observer = new PerformanceObserver((list) => {
                  const entries = list.getEntries();
                  entries.forEach((entry) => {
                    if (entry.entryType === 'largest-contentful-paint') {
                      console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'first-input') {
                      console.log('FID:', entry.processingStart - entry.startTime);
                    }
                    if (entry.entryType === 'layout-shift') {
                      if (!entry.hadRecentInput) {
                        console.log('CLS:', entry.value);
                      }
                    }
                  });
                });
                
                try {
                  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
                } catch (e) {
                  console.log('Performance Observer not fully supported');
                }
              }
            `,
          }}
        />
      </body>
    </html>
  );
}