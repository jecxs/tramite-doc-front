import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: 'Sistema de Gestión Documental',
  description: 'Sistema universitario para gestión y entrega de documentos',
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
    <Providers>{children}</Providers>
    </body>
    </html>
  );
}
