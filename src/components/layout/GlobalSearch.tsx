// src/components/layout/GlobalSearch.tsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, FileText, User, Calendar, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { getProcedures } from '@/lib/api/tramites';
import { Procedure } from '@/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { PROCEDURE_STATE_LABELS } from '@/lib/constants';
import { useDebounce } from '@/hooks/useDebounce';

interface GlobalSearchProps {
  isCompact?: boolean;
  onResultClick?: () => void;
}

export default function GlobalSearch({ isCompact = false, onResultClick }: GlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Procedure[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Debounce para evitar muchas peticiones
  const debouncedQuery = useDebounce(query, 300);

  // Cerrar al hacer click fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar trámites
  const searchProcedures = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setResults([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await getProcedures({
        search: searchQuery,
        limite: 8, // Limitamos a 8 resultados para el preview
        ordenar_por: 'fecha_envio',
        orden: 'desc',
      });

      setResults(response.data);
      setIsOpen(true);
    } catch (err) {
      setError('Error al buscar trámites');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Ejecutar búsqueda cuando cambie el query debounced
  useEffect(() => {
    searchProcedures(debouncedQuery);
  }, [debouncedQuery, searchProcedures]);

  const handleResultClick = (tramite: Procedure) => {
    // Determinar la ruta según el rol del usuario
    // Esto lo puedes ajustar según tu lógica de rutas
    const baseRoute = '/responsable/tramites'; // o '/trabajador/tramites'
    router.push(`${baseRoute}/${tramite.id_tramite}`);

    setIsOpen(false);
    setQuery('');
    onResultClick?.();
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
    }
  };

  return (
    <div ref={searchRef} className="relative w-full">
      {/* Input de búsqueda */}
      <div className="relative group">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-white/30
          group-hover:text-gray-700 dark:group-hover:text-white/50 transition-colors
          ${isCompact ? 'w-3.5 h-3.5 left-3' : 'w-4 h-4'}`}
        />

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setIsOpen(true)}
          placeholder={isCompact ? "Buscar..." : "Buscar trámites, documentos..."}
          className={`w-full transition-all duration-200 border
            bg-white/80 border-gray-300 text-gray-900 placeholder-gray-500
            focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white
            dark:bg-white/5 dark:border-white/10 dark:text-white dark:placeholder-white/30
            dark:focus:ring-purple-500/50 dark:focus:border-transparent dark:focus:bg-white/[0.07]
            ${isCompact
            ? 'pl-9 pr-3 py-1.5 rounded-lg text-xs'
            : 'pl-11 pr-12 py-2.5 rounded-xl text-sm'
          }`}
        />

        {/* Loading spinner o clear button */}
        <div className={`absolute right-4 top-1/2 -translate-y-1/2 ${isCompact ? 'right-3' : ''}`}>
          {isLoading ? (
            <Loader2 className={`animate-spin text-gray-500 dark:text-white/30
              ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
            />
          ) : query ? (
            <button
              onClick={handleClear}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            >
              <X className={`text-gray-500 dark:text-white/30
                ${isCompact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
              />
            </button>
          ) : null}
        </div>
      </div>

      {/* Resultados */}
      <AnimatePresence>
        {isOpen && (query.length >= 2) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 mt-2 backdrop-blur-2xl rounded-2xl shadow-2xl border z-50 overflow-hidden
              bg-white/98 border-gray-200
              dark:bg-slate-900/95 dark:border-white/10"
          >
            {error ? (
              <div className="p-4 text-center text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            ) : results.length === 0 && !isLoading ? (
              <div className="p-8 text-center">
                <Search className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-white/20" />
                <p className="text-sm text-gray-600 dark:text-white/40">
                  No se encontraron trámites
                </p>
                <p className="text-xs text-gray-500 dark:text-white/30 mt-1">
                  Intenta con otro término de búsqueda
                </p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 px-4 py-3 border-b bg-gray-50/80 border-gray-200 dark:bg-white/5 dark:border-white/10">
                  <p className="text-xs font-medium text-gray-600 dark:text-white/40">
                    {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Lista de resultados */}
                <div className="p-2">
                  {results.map((tramite) => (
                    <motion.button
                      key={tramite.id_tramite}
                      onClick={() => handleResultClick(tramite)}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5
                        transition-colors group"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icono */}
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                          bg-blue-100 dark:bg-blue-500/10">
                          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {tramite.asunto}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium whitespace-nowrap
                              ${tramite.estado === 'FIRMADO'
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400'
                              : 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                            }`}>
                              {PROCEDURE_STATE_LABELS[tramite.estado]}
                            </span>
                          </div>

                          <p className="text-xs text-gray-600 dark:text-white/40 mb-2 line-clamp-1">
                            {tramite.documento.titulo}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-white/30">
                            <div className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              <span>{tramite.receptor.nombres} {tramite.receptor.apellidos}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>
                                {format(new Date(tramite.fecha_envio), "dd MMM yyyy", { locale: es })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>

                {/* Footer - Ver todos los resultados */}
                {results.length >= 8 && (
                  <div className="sticky bottom-0 p-3 border-t bg-gray-50/80 border-gray-200 dark:bg-white/5 dark:border-white/10">
                    <button
                      onClick={() => {
                        router.push(`/responsable/tramites?search=${encodeURIComponent(query)}`);
                        setIsOpen(false);
                        setQuery('');
                      }}
                      className="w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400
                        hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                    >
                      Ver todos los resultados →
                    </button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
