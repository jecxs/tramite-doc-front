'use client';

import { useAuth, useRole } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { LogOut, User, Menu, Bell, Search, Settings, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import NotificationBadge from '@/components/notifications/NotificationBadge';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

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

  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (latest) => {
      setIsScrolled(latest > 50);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const navbarWidth = useTransform(
    scrollY,
    [0, 100],
    ['calc(100% - 2rem)', 'min(600px, calc(100% - 4rem))'],
  );

  const navbarPadding = useTransform(scrollY, [0, 100], ['1.5rem 2rem', '0.75rem 1.5rem']);

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
    <nav className='fixed top-0 left-0 right-0 z-50 px-4 lg:px-8 pt-4 flex justify-center'>
      <motion.div
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className='relative backdrop-blur-xl rounded-[1.75rem]
            bg-white/60
            border border-white/40
            ring-1 ring-black/5
            shadow-[0_8px_30px_rgb(0,0,0,0.04)]

            dark:bg-slate-900/60
            dark:border-white/10
            dark:ring-white/10
            dark:shadow-black/50'
        style={{
          background: isScrolled ? 'var(--navbar-bg-scrolled)' : 'var(--navbar-bg)',
          width: navbarWidth,
        }}
      >
        {/* Gradient overlay */}
        <div className='absolute inset-0 bg-gradient-to-r from-blue-50/30 via-transparent to-purple-50/30 dark:from-blue-500/5 dark:via-transparent dark:to-purple-500/5 rounded-[1.75rem] pointer-events-none' />

        <motion.div
          style={{
            padding: navbarPadding,
          }}
          className='relative'
        >
          <AnimatePresence mode='wait'>
            {isScrolled ? (
              // Versión compacta
              <motion.div
                key='compact'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='flex items-center justify-between h-12'
              >
                {/* Left - Menu button */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onMenuClick}
                  className='lg:hidden p-2 rounded-xl transition-colors duration-200 border
                    bg-gray-100 hover:bg-gray-200 border-gray-300
                    dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10'
                  aria-label='Abrir menú'
                >
                  <Menu className='w-4 h-4 text-gray-700 dark:text-white' />
                </motion.button>

                {/* Center - Compact search */}
                <div className='flex-1 max-w-sm mx-4'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 dark:text-white/30' />
                    <input
                      type='text'
                      placeholder='Buscar...'
                      className='w-full pl-9 pr-3 py-1.5 rounded-lg text-xs border transition-all duration-200
                        bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500
                        focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white
                        dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-white/30
                        dark:focus:ring-purple-500/50 dark:focus:border-transparent'
                    />
                  </div>
                </div>

                {/* Right - Compact user section */}
                <div className='flex items-center gap-2'>
                  <div className='hidden sm:block'>
                    <NotificationBadge />
                  </div>

                  <div className='relative' ref={menuRef}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className='flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 border
                        bg-gray-100 hover:bg-gray-200 border-gray-300
                        dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10'
                    >
                      <div className='relative'>
                        <div className='w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg'>
                          <span className='text-white font-bold text-xs'>
                            {user.nombres.charAt(0)}
                            {user.apellidos.charAt(0)}
                          </span>
                        </div>
                        <div className='absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white dark:border-slate-900'></div>
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
                            className='absolute right-0 mt-3 w-72 backdrop-blur-2xl rounded-2xl shadow-2xl border z-50 overflow-hidden
                              bg-white/98 border-gray-200
                              dark:bg-slate-900/95 dark:border-white/10'
                          >
                            {/* Header */}
                            <div
                              className='relative p-5 border-b
                              bg-gray-50/80 border-gray-200
                              dark:bg-white/5 dark:border-white/10'
                            >
                              <div className='flex items-start gap-3'>
                                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0'>
                                  <span className='text-white font-bold text-base'>
                                    {user.nombres.charAt(0)}
                                    {user.apellidos.charAt(0)}
                                  </span>
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <p className='text-sm font-bold truncate mb-1 text-gray-900 dark:text-white'>
                                    {user.nombres} {user.apellidos}
                                  </p>
                                  <p className='text-xs truncate mb-2 text-gray-600 dark:text-white/50'>
                                    {user.correo}
                                  </p>
                                  <span
                                    className='inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border
                                    bg-blue-50 text-blue-700 border-blue-200
                                    dark:bg-white/10 dark:text-white/80 dark:border-white/10'
                                  >
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
                                className='flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                  hover:bg-gray-100 dark:hover:bg-white/5'
                              >
                                <div
                                  className='w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                                  bg-gray-100 group-hover:bg-gray-200
                                  dark:bg-white/5 dark:group-hover:bg-white/10'
                                >
                                  <User className='w-4 h-4 text-gray-700 dark:text-white/60' />
                                </div>
                                <div className='flex-1'>
                                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                                    Mi Perfil
                                  </p>
                                  <p className='text-xs text-gray-600 dark:text-white/40'>
                                    Ver información personal
                                  </p>
                                </div>
                              </Link>
                              <Link
                                href='/configuracion'
                                onClick={() => setShowUserMenu(false)}
                                className='flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                  hover:bg-gray-100 dark:hover:bg-white/5'
                              >
                                <div
                                  className='w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                                  bg-gray-100 group-hover:bg-gray-200
                                  dark:bg-white/5 dark:group-hover:bg-white/10'
                                >
                                  <Settings className='w-4 h-4 text-gray-700 dark:text-white/60' />
                                </div>
                                <div className='flex-1'>
                                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                                    Configuración
                                  </p>
                                  <p className='text-xs text-gray-600 dark:text-white/40'>
                                    Ajustes del sistema
                                  </p>
                                </div>
                              </Link>
                              <ThemeToggle />
                              <div className='my-2 h-px bg-gray-200 dark:bg-white/10'></div>

                              <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={handleLogout}
                                className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group border
                                  hover:bg-red-50 border-transparent hover:border-red-200
                                  dark:hover:bg-red-500/10 dark:hover:border-red-500/20'
                              >
                                <div
                                  className='w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                                  bg-red-50 group-hover:bg-red-100
                                  dark:bg-red-500/10 dark:group-hover:bg-red-500/20'
                                >
                                  <LogOut className='w-4 h-4 text-red-600 dark:text-red-400' />
                                </div>
                                <div className='flex-1 text-left'>
                                  <p className='text-sm font-medium text-red-600 dark:text-red-400'>
                                    Cerrar Sesión
                                  </p>
                                  <p className='text-xs text-red-500 dark:text-red-400/50'>
                                    Salir del sistema
                                  </p>
                                </div>
                              </motion.button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className='sm:hidden'>
                    <NotificationBadge />
                  </div>
                </div>
              </motion.div>
            ) : (
              // Versión expandida
              <motion.div
                key='expanded'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className='flex items-center justify-between h-10'
              >
                {/* Left section */}
                <div className='flex items-center gap-4'>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onMenuClick}
                    className='lg:hidden p-2.5 rounded-xl transition-colors duration-200 border
                      bg-gray-100 hover:bg-gray-200 border-gray-300
                      dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10'
                    aria-label='Abrir menú'
                  >
                    <Menu className='w-5 h-5 text-gray-700 dark:text-white' />
                  </motion.button>

                  <div className='hidden sm:flex items-center gap-2 text-sm'>
                    <span className='text-gray-600 dark:text-white/40'>Inicio</span>
                    <ChevronRight className='w-4 h-4 text-gray-400 dark:text-white/20' />
                    <span className='text-gray-900 dark:text-white font-medium'>Dashboard</span>
                  </div>
                </div>

                {/* Center - Search bar */}
                <div className='hidden md:flex flex-1 max-w-md mx-8'>
                  <div className='relative w-full group'>
                    {/* <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-white/30 group-hover:text-gray-700 dark:group-hover:text-white/50 transition-colors' />
                    <input
                      type='text'
                      placeholder='Buscar trámites, documentos...'
                      className='w-full pl-11 pr-4 py-2.5 rounded-xl text-sm border transition-all duration-200
                        bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500
                        focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white
                        dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-white/30
                        dark:focus:ring-purple-500/50 dark:focus:border-transparent dark:focus:bg-white/[0.07]'
                    /> */}
                  </div>
                </div>

                {/* Right section */}
                <div className='flex items-center gap-2'>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSearch(!showSearch)}
                    className='md:hidden p-2.5 rounded-xl transition-colors duration-200 border
                      bg-gray-100 hover:bg-gray-200 border-gray-300
                      dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10'
                  >
                    <Search className='w-5 h-5 text-gray-700 dark:text-white/80' />
                  </motion.button>

                  <div className='hidden sm:block'>
                    <NotificationBadge />
                  </div>

                  <div className='relative' ref={menuRef}>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className='flex items-center gap-3 pl-3 pr-2 py-2 rounded-xl transition-all duration-200 border
                        bg-gray-100 hover:bg-gray-200 border-gray-300
                        dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10'
                    >
                      <div className='hidden lg:block text-right'>
                        <p className='text-sm font-semibold leading-tight text-gray-900 dark:text-white'>
                          {user.nombres} {user.apellidos}
                        </p>
                        <p className='text-xs mt-0.5 text-gray-600 dark:text-white/40'>
                          {getRoleName(currentRole)}
                        </p>
                      </div>

                      <div className='relative'>
                        <div className='w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0'>
                          <span className='text-white font-bold text-xs'>
                            {user.nombres.charAt(0)}
                            {user.apellidos.charAt(0)}
                          </span>
                        </div>
                        <div className='absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-slate-900'></div>
                      </div>
                    </motion.button>

                    {/* Dropdown menu (igual que arriba) */}
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
                            className='absolute right-0 mt-3 w-72 backdrop-blur-2xl rounded-2xl shadow-2xl border z-50 overflow-hidden
                              bg-white/98 border-gray-200
                              dark:bg-slate-900/95 dark:border-white/10'
                          >
                            <div
                              className='relative p-5 border-b
                              bg-gray-50/80 border-gray-200
                              dark:bg-white/5 dark:border-white/10'
                            >
                              <div className='flex items-start gap-3'>
                                <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0'>
                                  <span className='text-white font-bold text-base'>
                                    {user.nombres.charAt(0)}
                                    {user.apellidos.charAt(0)}
                                  </span>
                                </div>
                                <div className='flex-1 min-w-0'>
                                  <p className='text-sm font-bold truncate mb-1 text-gray-900 dark:text-white'>
                                    {user.nombres} {user.apellidos}
                                  </p>
                                  <p className='text-xs truncate mb-2 text-gray-600 dark:text-white/50'>
                                    {user.correo}
                                  </p>
                                  <span
                                    className='inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border
                                    bg-blue-50 text-blue-700 border-blue-200
                                    dark:bg-white/10 dark:text-white/80 dark:border-white/10'
                                  >
                                    {getRoleName(currentRole)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className='p-2'>
                              <Link
                                href='/perfil'
                                onClick={() => setShowUserMenu(false)}
                                className='flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                  hover:bg-gray-100 dark:hover:bg-white/5'
                              >
                                <div
                                  className='w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                                  bg-gray-100 group-hover:bg-gray-200
                                  dark:bg-white/5 dark:group-hover:bg-white/10'
                                >
                                  <User className='w-4 h-4 text-gray-700 dark:text-white/60' />
                                </div>
                                <div className='flex-1'>
                                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                                    Mi Perfil
                                  </p>
                                  <p className='text-xs text-gray-600 dark:text-white/40'>
                                    Ver información personal
                                  </p>
                                </div>
                              </Link>

                              {/* <Link
                                href='/configuracion'
                                onClick={() => setShowUserMenu(false)}
                                className='flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                                  hover:bg-gray-100 dark:hover:bg-white/5'
                              >
                                <div
                                  className='w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                                  bg-gray-100 group-hover:bg-gray-200
                                  dark:bg-white/5 dark:group-hover:bg-white/10'
                                >
                                  <Settings className='w-4 h-4 text-gray-700 dark:text-white/60' />
                                </div>
                                <div className='flex-1'>
                                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                                    Configuración
                                  </p>
                                  <p className='text-xs text-gray-600 dark:text-white/40'>
                                    Ajustes del sistema
                                  </p>
                                </div>
                              </Link> */}

                              <ThemeToggle />
                              <div className='my-2 h-px bg-gray-200 dark:bg-white/10'></div>

                              <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={handleLogout}
                                className='w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group border
                                  hover:bg-red-50 border-transparent hover:border-red-200
                                  dark:hover:bg-red-500/10 dark:hover:border-red-500/20'
                              >
                                <div
                                  className='w-9 h-9 rounded-xl flex items-center justify-center transition-colors
                                  bg-red-50 group-hover:bg-red-100
                                  dark:bg-red-500/10 dark:group-hover:bg-red-500/20'
                                >
                                  <LogOut className='w-4 h-4 text-red-600 dark:text-red-400' />
                                </div>
                                <div className='flex-1 text-left'>
                                  <p className='text-sm font-medium text-red-600 dark:text-red-400'>
                                    Cerrar Sesión
                                  </p>
                                  <p className='text-xs text-red-500 dark:text-red-400/50'>
                                    Salir del sistema
                                  </p>
                                </div>
                              </motion.button>
                            </div>
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className='sm:hidden'>
                    <NotificationBadge />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Mobile search overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='md:hidden mt-2 backdrop-blur-2xl rounded-2xl border overflow-hidden
              bg-white/98 border-gray-200
              dark:bg-slate-900/40 dark:border-white/10'
          >
            <div className='p-4'>
              <div className='relative'>
                <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-white/30' />
                <input
                  ref={searchRef}
                  type='text'
                  placeholder='Buscar trámites, documentos...'
                  className='w-full pl-11 pr-4 py-2.5 rounded-xl text-sm border transition-all
                    bg-white border-gray-300 text-gray-900 placeholder-gray-500
                    focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                    dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-white/30
                    dark:focus:ring-purple-500/50 dark:focus:border-transparent'
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
