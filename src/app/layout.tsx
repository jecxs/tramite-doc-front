import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Sistema de Gestión Documental',
  description: 'Sistema universitario para gestión y entrega de documentos',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='es' className='dark' suppressHydrationWarning>
    <head>
      <script
        dangerouslySetInnerHTML={{
          __html: `
              try {
                const theme = localStorage.getItem('theme') || 'dark';
                document.documentElement.classList.add(theme);
              } catch (e) {}
            `,
        }}
      />
    </head>
    <body className='antialiased'>
    <Providers>
      {children}
      <Toaster richColors position='top-right' theme='system' closeButton />
    </Providers>
    </body>
    </html>
  );
}
