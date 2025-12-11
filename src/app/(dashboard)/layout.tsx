'use client';
import '@/app/globals.css';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';
import Loading from '@/components/ui/Loading';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isLoading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Navbar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Container */}
      <div className='flex pt-25'>
        {/* Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content - CAMBIOS AQUÍ */}
        <main className='flex-1 w-full lg:ml-0'>
          {/* Removido max-w-7xl y ajustado padding */}
          <div className='w-full px-4 sm:px-6 lg:px-8 py-8'>{children}</div>
        </main>
      </div>
    </div>
  );
}
