'use client';

import { useAuth, useRole } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LogOut, User, ChevronDown, Menu } from 'lucide-react';
import NotificationBadge from '@/components/notifications/NotificationBadge';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { currentRole, getRoleName } = useRole();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  if (!user) return null;

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm'>
      <div className='px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between h-16'>
          {/* Left side */}
          <div className='flex items-center gap-4'>
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className='lg:hidden p-2.5 rounded-xl hover:bg-gray-100 transition-all duration-200 hover:scale-105 active:scale-95'
              aria-label='Abrir menú'
            >
              <Menu className='w-5 h-5 text-gray-700' />
            </button>

            {/* Logo */}
            <Link href='/' className='flex items-center gap-3 group'>
              <div className='relative w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow duration-200'>
                <Image src='/logo.png' alt='Logo' fill className='object-cover' priority />
              </div>
              <div className='hidden sm:block'>
                <h1 className='text-base font-semibold text-gray-900 tracking-tight'>
                  Sistema de Gestión
                </h1>
                <p className='text-xs text-gray-500 -mt-0.5'>Documental</p>
              </div>
            </Link>
          </div>

          {/* Right side */}
          <div className='flex items-center gap-3'>
            {/* Notifications */}
            <div className='hidden sm:block'>
              <NotificationBadge />
            </div>

            {/* User menu */}
            <div className='relative' ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className='flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-transparent hover:border-gray-200'
              >
                <div className='hidden md:block text-right'>
                  <p className='text-sm font-medium text-gray-900 leading-tight'>
                    {user.nombres} {user.apellidos}
                  </p>
                  <p className='text-xs text-gray-500 mt-0.5'>{getRoleName(currentRole)}</p>
                </div>

                {/* Avatar con gradiente mejorado */}
                <div className='relative'>
                  <div className='w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md ring-2 ring-white'>
                    <span className='text-white font-semibold text-sm'>
                      {user.nombres.charAt(0)}
                      {user.apellidos.charAt(0)}
                    </span>
                  </div>
                  <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                </div>

                <ChevronDown
                  className={`hidden sm:block w-4 h-4 text-gray-500 transition-transform duration-200 ${
                    showUserMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown menu mejorado */}
              {showUserMenu && (
                <>
                  <div className='fixed inset-0 z-40' onClick={() => setShowUserMenu(false)} />
                  <div className='absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200'>
                    {/* Header con gradiente */}
                    <div className='relative p-5 bg-gradient-to-br from-blue-50 to-indigo-50 border-b border-gray-100'>
                      <div className='flex items-start gap-3'>
                        <div className='w-12 h-12 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-md'>
                          <span className='text-white font-semibold'>
                            {user.nombres.charAt(0)}
                            {user.apellidos.charAt(0)}
                          </span>
                        </div>
                        <div className='flex-1 min-w-0'>
                          <p className='text-sm font-semibold text-gray-900 truncate'>
                            {user.nombres} {user.apellidos}
                          </p>
                          <p className='text-xs text-gray-600 mt-0.5 truncate'>{user.correo}</p>
                          <div className='mt-2'>
                            <span className='inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200'>
                              {getRoleName(currentRole)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className='p-2'>
                      <Link
                        href='/perfil'
                        onClick={() => setShowUserMenu(false)}
                        className='flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors group'
                      >
                        <div className='w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-blue-50 transition-colors'>
                          <User className='w-4 h-4 text-gray-600 group-hover:text-blue-600' />
                        </div>
                        <span className='text-sm text-gray-700 font-medium'>Mi Perfil</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 transition-colors group mt-1'
                      >
                        <div className='w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors'>
                          <LogOut className='w-4 h-4 text-red-600' />
                        </div>
                        <span className='text-sm font-medium text-red-600'>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile notification badge */}
            <div className='sm:hidden'>
              <NotificationBadge />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
