'use client';

import { useRole } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    FileText,
    Send,
    Users,
    Building2,
    FileType,
    BarChart3,
    PenTool,
    MessageSquare,
    X,
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
        href: '/admin',
        icon: <Home className="w-5 h-5" />,
        roles: ['ADMIN'],
    },
    {
        label: 'Usuarios',
        href: '/admin/usuarios',
        icon: <Users className="w-5 h-5" />,
        roles: ['ADMIN'],
    },
    {
        label: 'Áreas',
        href: '/admin/areas',
        icon: <Building2 className="w-5 h-5" />,
        roles: ['ADMIN'],
    },
    {
        label: 'Tipos de Documento',
        href: '/admin/tipo-documentos',
        icon: <FileType className="w-5 h-5" />,
        roles: ['ADMIN'],
    },
    {
        label: 'Estadísticas',
        href: '/admin/estadisticas',
        icon: <BarChart3 className="w-5 h-5" />,
        roles: ['ADMIN'],
    },

    // Responsable navigation
    {
        label: 'Dashboard',
        href: '/responsable',
        icon: <Home className="w-5 h-5" />,
        roles: ['RESP'],
    },
    {
        label: 'Enviar Documento',
        href: '/responsable/tramites/nuevo',
        icon: <Send className="w-5 h-5" />,
        roles: ['RESP'],
    },
    {
        label: 'Mis Trámites',
        href: '/responsable/tramites',
        icon: <FileText className="w-5 h-5" />,
        roles: ['RESP'],
    },
    {
        label: 'Observaciones',
        href: '/responsable/observaciones',
        icon: <MessageSquare className="w-5 h-5" />,
        roles: ['RESP'],
    },

    // Trabajador navigation
    {
        label: 'Dashboard',
        href: '/trabajador',
        icon: <Home className="w-5 h-5" />,
        roles: ['TRAB'],
    },
    {
        label: 'Mis Documentos',
        href: '/trabajador/tramites',
        icon: <FileText className="w-5 h-5" />,
        roles: ['TRAB'],
    },
    {
        label: 'Mis Observaciones',
        href: '/trabajador/observaciones',
        icon: <MessageSquare className="w-5 h-5" />,
        roles: ['TRAB'],
    },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const { currentRole } = useRole();

    const filteredNavItems = navItems.filter((item) =>
        item.roles.includes(currentRole || '')
    );

    const isActive = (href: string) => {
        if (href === '/admin' || href === '/responsable' || href === '/trabajador') {
            return pathname === href;
        }
        return pathname?.startsWith(href);
    };

    return (
        <>
            {/* Overlay para mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed lg:sticky top-0 left-0 z-30
                    h-screen w-64 bg-white border-r border-gray-200
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}
            >
                {/* Header mobile */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Menú</h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md hover:bg-gray-100"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1 mt-16 lg:mt-0">
                    {filteredNavItems.map((item) => {
                        const active = isActive(item.href);

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={onClose}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-lg
                                    transition-colors
                                    ${
                                    active
                                        ? 'bg-blue-50 text-blue-700 font-medium'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }
                                `}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}