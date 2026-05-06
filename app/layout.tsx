import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  title: "S-Square Marketings",
  description: "Find your dream property",
  openGraph: {
    title: "S Square Realty",
    description: "Find your dream property",
    url: "https://yourdomain.com",
    siteName: "S Square Realty",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
}

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-slate-50 text-slate-900`}>
        {children}
      </body>
    </html>
  )
}
