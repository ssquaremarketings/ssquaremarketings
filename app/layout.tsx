import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ssquaremarketings.com'),
  title: {
    default: 'S-Square Marketings | Open Plots, Houses & Agriculture Lands in Proddatur',
    template: '%s | S-Square Marketings'
  },
  description:
    'S-Square Marketings is a trusted real estate company in Proddatur, Andhra Pradesh offering open plots, houses, agriculture lands and premium ventures with transparent documentation and customer-first service.',
  keywords: [
    'S-Square Marketings',
    'Real Estate Proddatur',
    'Open Plots in Proddatur',
    'Plots for Sale in Proddatur',
    'Agriculture Lands in Proddatur',
    'Real Estate Andhra Pradesh',
    'House Plots in Andhra Pradesh',
    'Property Dealers Proddatur',
    'Ventures in Proddatur',
    'Real Estate Company Proddatur'
  ],
  alternates: {
    canonical: 'https://www.ssquaremarketings.com'
  },
  icons: {
    icon: '/branding.png',
    shortcut: '/branding.png',
    apple: '/branding.png'
  },
  openGraph: {
    title: 'S-Square Marketings | Open Plots, Houses & Agriculture Lands in Proddatur',
    description:
      'Explore open plots, houses, agriculture lands and premium ventures in Proddatur, Andhra Pradesh.',
    url: 'https://www.ssquaremarketings.com',
    siteName: 'S-Square Marketings',
    images: [
      {
        url: '/branding.png',
        width: 1200,
        height: 630,
        alt: 'S-Square Marketings'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'S-Square Marketings | Open Plots, Houses & Agriculture Lands in Proddatur',
    description:
      'Trusted real estate company in Proddatur offering plots, houses and agriculture lands.',
    images: ['/branding.png']
  }
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
