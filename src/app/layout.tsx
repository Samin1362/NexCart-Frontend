import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import ThemeProvider from '@/providers/ThemeProvider';
import AuthProvider from '@/providers/AuthProvider';
import CartProvider from '@/providers/CartProvider';
import ChatWidget from '@/components/ChatWidget';
import ServerWakeLoader from '@/components/ServerWakeLoader';
import SmoothScrollProvider from '@/components/SmoothScrollProvider';
import ScrollProgress from '@/components/ui/ScrollProgress';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NexCart — Modern E-Commerce',
  description: 'A sharp, professional e-commerce platform built with Next.js and TypeScript.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <CartProvider>
              <SmoothScrollProvider>
                <ScrollProgress />
                {children}
                <ChatWidget />
                <ServerWakeLoader />
              </SmoothScrollProvider>
            </CartProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
