import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Quizzty - Juegos Interactivos Didácticos en Tiempo Real',
  description: 'Crea quizzes interactivos y conecta con tus estudiantes en tiempo real mediante QR',
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950 text-white`}>
        {children}
        <Toaster
          position="top-right"
          richColors
          toastOptions={{
            className: '!bg-slate-900 !border-slate-800 !text-white',
          }}
        />
      </body>
    </html>
  )
}
