import type { Metadata } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { MetaPixel } from '@/components/MetaPixel'
import { DEFAULT_STORE_SETTINGS, getStoreSettings } from '@/lib/db'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const display = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings().catch(() => DEFAULT_STORE_SETTINGS)
  return {
    title: `${settings.name} — Cosmetics`,
    description: settings.description,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${display.variable}`}>
      <body>
        <MetaPixel />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
