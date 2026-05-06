import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'S-Square Marketings',
    template: '%s | S-Square Marketings'
  },
  description: 'Find your dream property with S-Square Marketings.',
  keywords: ['real estate', 'properties', 'open plots', 'apartments', 'houses'],
  alternates: {
    canonical: '/'
  },
  openGraph: {
    title: 'S-Square Marketings',
    description: 'Find your dream property with S-Square Marketings.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName: 'S-Square Marketings',
    images: [
      {
        url: '/branding.png',
        width: 1200,
        height: 630
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S-Square Marketings',
    description: 'Find your dream property with S-Square Marketings.',
    images: ['/branding.png']
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
