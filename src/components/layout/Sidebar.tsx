'use client';

import { useRole } from '@/contexts/AuthContext';
import Link from 'next/link';
import { ROLES, ROUTE_PATHS } from '@/lib/constants';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  FileText,
  Send,
  Users,
  Building2,
  FileType,
  BarChart3,
  MessageSquare,
  X,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  // Admin navigation
  {
    label: 'Dashboard',
    href: ROUTE_PATHS.ADMIN_DASHBOARD,
    icon: <Home className='w-5 h-5' />,
    roles: [ROLES.ADMIN],
  },
  {
    label: 'Usuarios',
    href: ROUTE_PATHS.ADMIN_USERS,
    icon: <Users className='w-5 h-5' />,
    roles: [ROLES.ADMIN],
  },
  {
    label: 'Áreas',
    href: ROUTE_PATHS.ADMIN_AREAS,
    icon: <Building2 className='w-5 h-5' />,
    roles: [ROLES.ADMIN],
  },
  {
    label: 'Tipos de Documento',
    href: ROUTE_PATHS.ADMIN_DOCUMENT_TYPES,
    icon: <FileType className='w-5 h-5' />,
    roles: [ROLES.ADMIN],
  },
  {
    label: 'Estadísticas',
    href: ROUTE_PATHS.ADMIN_DASHBOARD + '/estadisticas',
    icon: <BarChart3 className='w-5 h-5' />,
    roles: [ROLES.ADMIN],
  },

  // Responsable navigation
  {
    label: 'Dashboard',
    href: ROUTE_PATHS.RESP_DASHBOARD,
    icon: <Home className='w-5 h-5' />,
    roles: [ROLES.RESP],
  },
  {
    label: 'Enviar Documento',
    href: ROUTE_PATHS.RESP_SEND_DOCUMENT,
    icon: <Send className='w-5 h-5' />,
    roles: [ROLES.RESP],
  },
  {
    label: 'Mis Trámites',
    href: ROUTE_PATHS.RESP_PROCEDURES,
    icon: <FileText className='w-5 h-5' />,
    roles: [ROLES.RESP],
  },
  {
    label: 'Observaciones',
    href: ROUTE_PATHS.RESP_OBSERVATIONS,
    icon: <MessageSquare className='w-5 h-5' />,
    roles: [ROLES.RESP],
  },
  {
    label: 'Estadísticas',
    href: ROUTE_PATHS.RESP_ESTADISTICAS,
    icon: <BarChart3 className='w-5 h-5' />,
    roles: [ROLES.RESP],
  },

  // Trabajador navigation
  {
    label: 'Dashboard',
    href: ROUTE_PATHS.WORKER_DASHBOARD,
    icon: <Home className='w-5 h-5' />,
    roles: [ROLES.TRAB],
  },
  {
    label: 'Mis Documentos',
    href: ROUTE_PATHS.WORKER_DOCUMENTS,
    icon: <FileText className='w-5 h-5' />,
    roles: [ROLES.TRAB],
  },
  {
    label: 'Mis Observaciones',
    href: ROUTE_PATHS.WORKER_OBSERVATIONS,
    icon: <MessageSquare className='w-5 h-5' />,
    roles: [ROLES.TRAB],
  },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { currentRole, getRoleName } = useRole();

  const filteredNavItems = navItems.filter((item) => item.roles.includes(currentRole || ''));

  const isActive = (href: string) => {
    if (!pathname) return false;

    if (
      href === ROUTE_PATHS.ADMIN_DASHBOARD ||
      href === ROUTE_PATHS.RESP_DASHBOARD ||
      href === ROUTE_PATHS.WORKER_DASHBOARD
    ) {
      return pathname === href;
    }

    if (href === ROUTE_PATHS.RESP_SEND_DOCUMENT) {
      return pathname === href || pathname.startsWith(href);
    }

    if (href === ROUTE_PATHS.RESP_PROCEDURES) {
      if (pathname === href) return true;
      if (pathname.startsWith(href + '/')) {
        const rest = pathname.slice(href.length + 1);
        return rest.length > 0 && !rest.startsWith('nuevo');
      }
      return false;
    }

    if (href === ROUTE_PATHS.WORKER_DOCUMENTS) {
      return pathname === href || pathname.startsWith(href + '/');
    }

    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Overlay para mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden'
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -288,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
        className='fixed lg:sticky top-0 left-0 z-50 h-screen w-72 lg:!transform-none'
      >
        {/* Glass container */}
        <div className='relative h-full m-4 lg:m-6 rounded-[2rem] overflow-hidden border shadow-xl
  bg-white/80 backdrop-blur-xl border-gray-200
  dark:bg-[#272d34] dark:border-white/10'>

          {/* Animated gradient border effect */}
          <div className='absolute inset-0 rounded-[2rem] bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none'
               style={{ padding: '1px', WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />

          {/* Close button - Mobile only */}
          <div className='lg:hidden absolute top-6 right-6 z-10'>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className='p-2 rounded-xl transition-colors border
                bg-gray-100 hover:bg-gray-200 border-gray-300
                dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10'
            >
              <X className='w-5 h-5 text-gray-700 dark:text-white/80' />
            </motion.button>
          </div>

          {/* Logo section */}
          <div className='relative p-8 pb-6'>
            <Link href='/' className='flex items-center gap-3 group'>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className='relative w-11 h-11 rounded-2xl overflow-hidden shadow-lg ring-2
                  ring-gray-300 dark:ring-white/10'
              >
                <Image
                  src='/logo.png'
                  alt='Logo'
                  fill
                  className='object-cover'
                  priority
                />
              </motion.div>
              <div>
                <h1 className='text-base font-bold tracking-tight
                  text-gray-900 dark:text-white'>
                  Sistema de Gestión
                </h1>
                <p className='text-xs text-gray-600 dark:text-white/40'>Documental</p>
              </div>
            </Link>
          </div>

          {/* User info card */}
          <div className='relative px-6 pb-6'>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className='relative rounded-2xl p-4 border backdrop-blur-sm group transition-all duration-300
                bg-gray-50 border-gray-200 hover:bg-gray-100
                dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/[0.07]'
            >
              <div className='flex items-center gap-3'>
                <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ring-2
                  ring-gray-300 dark:ring-white/10'>
                  <span className='text-white font-bold text-sm'>{currentRole?.charAt(0)}</span>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-xs font-medium mb-0.5 text-gray-600 dark:text-white/40'>Perfil actual</p>
                  <p className='text-sm font-semibold truncate text-gray-900 dark:text-white'>
                    {getRoleName(currentRole)}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Navigation */}
          <nav className='relative px-4 space-y-1 overflow-y-auto h-[calc(100vh-280px)] scrollbar-thin
            scrollbar-thumb-gray-300 dark:scrollbar-thumb-white/5 scrollbar-track-transparent'>
            {filteredNavItems.map((item, index) => {
              const active = isActive(item.href);

              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className='group relative block'
                  >
                    <div
                      className={`
                        relative flex items-center gap-3 px-4 py-3 rounded-xl
                        transition-all duration-200
                        ${
                        active
                          ? 'bg-blue-50 text-blue-700 shadow-md dark:bg-white/10 dark:text-white dark:shadow-lg dark:shadow-black/5'
                          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5'
                      }
                      `}
                    >
                      {/* Active indicator line */}
                      {active && (
                        <motion.div
                          layoutId='activeTab'
                          className='absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full
                            bg-gradient-to-b from-blue-500 to-blue-600
                            dark:from-purple-400 dark:to-pink-400'
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <div className='flex-shrink-0'>
                        {item.icon}
                      </div>

                      {/* Label */}
                      <span className='flex-1 text-sm font-medium'>
                        {item.label}
                      </span>

                      {/* Hover indicator dot */}
                      {!active && (
                        <div className='w-1 h-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity
                          bg-gray-500 dark:bg-white/30' />
                      )}
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Bottom section */}
          <div className='absolute bottom-0 left-0 right-0 p-4 space-y-2 border-t
            border-gray-200 dark:border-white/10
            bg-white/50 dark:bg-[#272d34]/50'>
            {/* Settings button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className='w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                text-gray-700 hover:text-gray-900 hover:bg-gray-100
                dark:text-white/50 dark:hover:text-white dark:hover:bg-white/5'
            >
              <Settings className='w-5 h-5' />
              <span className='text-sm font-medium'>Configuración</span>
            </motion.button>

            {/* Footer */}
            <div className='flex items-center justify-between px-2 py-2 text-xs
              text-gray-500 dark:text-white/30'>
              <span>© 2025 SGD</span>
              <span className='font-mono'>v1.0.0</span>
            </div>
          </div>
        </div>
      </motion.aside>
    </>
  );
}
