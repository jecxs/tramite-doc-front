import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Iniciar Sesión - Sistema de Gestión',
  description: 'Acceso al sistema de gestión de documentos',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-[#0f172a] dark:to-[#111827] flex items-center justify-center p-4'>
      {children}
    </div>
  );
}
