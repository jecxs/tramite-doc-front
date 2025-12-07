'use client';

import { useAuth, useRole } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LogOut, User, Menu, Bell, Search, Settings, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBadge from '@/components/notifications/NotificationBadge';

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, logout } = useAuth();
  const { currentRole, getRoleName } = useRole();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  if (!user) return null;

  return (
    <nav className='fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 pt-4'>
      <div className='relative bg-slate-900/40 backdrop-blur-2xl rounded-[1.75rem] border border-white/10 shadow-2xl' style={{background:'#272d34'}}>
        {/* Subtle gradient overlay */}
        <div className='absolute inset-0 via-transparent to-blue-500/5 rounded-[1.75rem] pointer-events-none' />

        <div className='relative px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* Left section */}
            <div className='flex items-center gap-4'>
              {/* Mobile menu button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMenuClick}
                className='lg:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200 border border-white/10'
                aria-label='Abrir menú'
              >
                <Menu className='w-5 h-5 text-white' />
              </motion.button>

              {/* Breadcrumb or page title */}
              <div className='hidden sm:flex items-center gap-2 text-sm'>
                <span className='text-white/40'>Inicio</span>
                <ChevronRight className='w-4 h-4 text-white/20' />
                <span className='text-white font-medium'>Dashboard</span>
              </div>
            </div>

            {/* Center - Search bar */}
            <div className='hidden md:flex flex-1 max-w-md mx-8'>
              <div className='relative w-full group'>
                <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 group-hover:text-white/50 transition-colors' />
                <input
                  type='text'
                  placeholder='Buscar trámites, documentos...'
                  className='w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent focus:bg-white/[0.07] transition-all duration-200'
                />
              </div>
            </div>

            {/* Right section */}
            <div className='flex items-center gap-2'>
              {/* Mobile search button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSearch(!showSearch)}
                className='md:hidden p-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-200 border border-white/10'
              >
                <Search className='w-5 h-5 text-white/80' />
              </motion.button>

              {/* Notifications */}
              <div className='hidden sm:block'>
                <NotificationBadge />
              </div>

              {/* User menu */}
              <div className='relative' ref={menuRef}>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className='flex items-center gap-3 pl-3 pr-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10'
                >
                  <div className='hidden lg:block text-right'>
                    <p className='text-sm font-semibold text-white leading-tight'>
                      {user.nombres} {user.apellidos}
                    </p>
                    <p className='text-xs text-white/40 mt-0.5'>{getRoleName(currentRole)}</p>
                  </div>

                  {/* Avatar */}
                  <div className='relative'>
                    <div className='w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0'>
                      <span className='text-white font-bold text-xs'>
                        {user.nombres.charAt(0)}
                        {user.apellidos.charAt(0)}
                      </span>
                    </div>
                    <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900'></div>
                  </div>
                </motion.button>

                {/* Dropdown menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='fixed inset-0 z-40'
                        onClick={() => setShowUserMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className='absolute right-0 mt-3 w-72 bg-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10 z-50 overflow-hidden'
                      >
                        {/* Header */}
                        <div className='relative p-5 bg-white/5 border-b border-white/10'>
                          <div className='flex items-start gap-3'>
                            <div className='w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0'>
                              <span className='text-white font-bold text-base'>
                                {user.nombres.charAt(0)}
                                {user.apellidos.charAt(0)}
                              </span>
                            </div>
                            <div className='flex-1 min-w-0'>
                              <p className='text-sm font-bold text-white truncate mb-1'>
                                {user.nombres} {user.apellidos}
                              </p>
                              <p className='text-xs text-white/50 truncate mb-2'>{user.correo}</p>
                              <span className='inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white/10 text-white/80 border border-white/10'>
                                {getRoleName(currentRole)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className='p-2'>
                          <Link
                            href='/perfil'
                            onClick={() => setShowUserMenu(false)}
                            className='flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 group'
                          >
                            <div className='w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors'>
                              <User className='w-4 h-4 text-white/60' />
                            </div>
                            <div className='flex-1'>
                              <p className='text-sm font-medium text-white'>Mi Perfil</p>
                              <p className='text-xs text-white/40'>Ver información personal</p>
                            </div>
                          </Link>

                          <Link
                            href='/configuracion'
                            onClick={() => setShowUserMenu(false)}
                            className='flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-all duration-200 group'
                          >
                            <div className='w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors'>
                              <Settings className='w-4 h-4 text-white/60' />
                            </div>
                            <div className='flex-1'>
                              <p className='text-sm font-medium text-white'>Configuración</p>
                              <p className='text-xs text-white/40'>Ajustes del sistema</p>
                            </div>
                          </Link>

                          <div className='my-2 h-px bg-white/10'></div>

                          <motion.button
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={handleLogout}
                            className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 transition-all duration-200 group border border-transparent hover:border-red-500/20'
                          >
                            <div className='w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors'>
                              <LogOut className='w-4 h-4 text-red-400' />
                            </div>
                            <div className='flex-1 text-left'>
                              <p className='text-sm font-medium text-red-400'>Cerrar Sesión</p>
                              <p className='text-xs text-red-400/50'>Salir del sistema</p>
                            </div>
                          </motion.button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile notification badge */}
              <div className='sm:hidden'>
                <NotificationBadge />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden mt-2 bg-slate-900/40 backdrop-blur-2xl rounded-2xl border border-white/10 overflow-hidden'
          >
            <div className='p-4'>
              <div className='relative'>
                <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30' />
                <input
                  ref={searchRef}
                  type='text'
                  placeholder='Buscar trámites, documentos...'
                  className='w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent'
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
