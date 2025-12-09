'use client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
// IMPORTANTE: Se importa el tipo 'Role' para la aserción
import { DEFAULT_ROUTE_BY_ROLE, ROUTE_PATHS, isRole } from '@/lib/constants';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // user.roles: string[]
        const rawRole = user.roles[0];

        if (!rawRole || !isRole(rawRole)) {
          console.error('Rol inválido recibido del servidor:', rawRole);
          // fallback: redirigir a login u otra ruta segura
          router.push(ROUTE_PATHS.LOGIN);
          return;
        }
        const defaultRoute = DEFAULT_ROUTE_BY_ROLE[rawRole];
        router.push(defaultRoute);
      } else {
        // Redirigir a login
        router.push(ROUTE_PATHS.LOGIN);
      }
    }
  }, [user, isLoading, router]);

  // Mostrar loading mientras se decide la redirección
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <div className='text-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto'></div>
        <p className='mt-4 text-gray-600'>Cargando...</p>
      </div>
    </div>
  );
}
