'use client';

import { useState } from 'react';
import { Search, ChevronDown, ChevronUp, X } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ProcedureFilters } from '@/types';
import { PROCEDURE_STATE_LABELS } from '@/lib/constants';

interface TramitesFiltersInlineProps {
  onApplyFilters: (filters: ProcedureFilters) => void;
  onClearFilters?: () => void;
  currentFilters?: ProcedureFilters;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
}

export default function TramitesFiltersInline({
                                                onApplyFilters,
                                                onClearFilters,
                                                currentFilters = {},
                                                showAdvanced,
                                                onToggleAdvanced,
                                              }: TramitesFiltersInlineProps) {
  const [search, setSearch] = useState(currentFilters.search || '');
  const [selectedEstado, setSelectedEstado] = useState<string>(currentFilters.estado || '');
  const [requiereFirma, setRequiereFirma] = useState<boolean | undefined>(
    currentFilters.requiere_firma,
  );

  const handleApply = () => {
    const filters: ProcedureFilters = {};

    if (search.trim()) filters.search = search.trim();
    if (selectedEstado) filters.estado = selectedEstado as any;
    if (requiereFirma !== undefined) filters.requiere_firma = requiereFirma;

    onApplyFilters(filters);
  };

  const handleClear = () => {
    setSearch('');
    setSelectedEstado('');
    setRequiereFirma(undefined);

    if (onClearFilters) {
      onClearFilters();
    } else {
      onApplyFilters({});
    }
  };

  const hasActiveFilters = search || selectedEstado || requiereFirma !== undefined;

  return (
    <div className='space-y-4'>
      {/* Filtros Básicos */}
      <div className='bg-white border border-gray-200 dark:border-slate-700/50 shadow-sm dark:bg-gradient-to-br dark:bg-[#152436] backdrop-blur-sm rounded-2xl p-6 transition-all'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          {/* Búsqueda */}
          <div className='md:col-span-2'>
            <label className='block text-sm font-medium text-foreground-300 mb-2'>Buscar</label>
            <div className='relative'>
              <Search className='absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400' />
              <input
                type='text'
                placeholder='Código o asunto del trámite...'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                className='w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400  focus:border-transparent transition-all'
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className='block text-sm font-medium text-foreground-300 mb-2'>Estado</label>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className='w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 transition-all appearance-none cursor-pointer'
            >
              <option value=''>Todos</option>
              {Object.entries(PROCEDURE_STATE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Requiere Firma */}
          <div>
            <label className='block text-sm font-medium text-foreground-300 mb-2'>Firma</label>
            <select
              value={requiereFirma === undefined ? '' : String(requiereFirma)}
              onChange={(e) =>
                setRequiereFirma(e.target.value === '' ? undefined : e.target.value === 'true')
              }
              className='w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none cursor-pointer'
            >
              <option value=''>Todos</option>
              <option value='true'>Requiere firma</option>
              <option value='false'>Sin firma</option>
            </select>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className='flex items-center justify-between mt-6 pt-6 border-t border-slate-700/50'>
          <button
            type='button'
            onClick={onToggleAdvanced}
            className='flex items-center gap-2 text-sm font-medium text-purple-400 hover:text-purple-300 transition-colors'
          >
            {showAdvanced ? (
              <>
                <ChevronUp className='w-4 h-4' />
                Ocultar filtros avanzados
              </>
            ) : (
              <>
                <ChevronDown className='w-4 h-4' />
                Mostrar filtros avanzados
              </>
            )}
          </button>

          <div className='flex items-center gap-3'>
            {hasActiveFilters && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleClear}
                className='text-gray-400 hover:text-white hover:bg-slate-700/50'
              >
                <X className='w-4 h-4 mr-2' />
                Limpiar
              </Button>
            )}
            <Button
              type='button'
              onClick={handleApply}
              size='sm'
              className='bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 rounded-xl shadow-lg'
            >
              Aplicar filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Mensaje de filtros activos */}
      {hasActiveFilters && (
        <div className='flex items-center gap-3 text-sm'>
          <span className='font-medium text-gray-300'>Filtros activos:</span>
          <div className='flex flex-wrap gap-2'>
            {search && (
              <span className='inline-flex items-center gap-2 px-3 py-1.5 bg-purple-900/30 text-purple-300 rounded-lg border border-purple-700/50'>
                Búsqueda: &ldquo;{search}&rdquo;
                <button
                  onClick={() => {
                    setSearch('');
                    handleApply();
                  }}
                  className='hover:text-purple-100 transition-colors'
                >
                  <X className='w-3 h-3' />
                </button>
              </span>
            )}
            {selectedEstado && (
              <span className='inline-flex items-center gap-2 px-3 py-1.5 bg-blue-900/30 text-blue-300 rounded-lg border border-blue-700/50'>
                Estado:{' '}
                {PROCEDURE_STATE_LABELS[selectedEstado as keyof typeof PROCEDURE_STATE_LABELS]}
                <button
                  onClick={() => {
                    setSelectedEstado('');
                    handleApply();
                  }}
                  className='hover:text-blue-100 transition-colors'
                >
                  <X className='w-3 h-3' />
                </button>
              </span>
            )}
            {requiereFirma !== undefined && (
              <span className='inline-flex items-center gap-2 px-3 py-1.5 bg-purple-900/30 text-purple-300 rounded-lg border border-purple-700/50'>
                {requiereFirma ? 'Con firma' : 'Sin firma'}
                <button
                  onClick={() => {
                    setRequiereFirma(undefined);
                    handleApply();
                  }}
                  className='hover:text-purple-100 transition-colors'
                >
                  <X className='w-3 h-3' />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
