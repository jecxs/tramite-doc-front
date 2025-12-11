// src/components/ui/WorkerSelector.tsx
// Componente reutilizable para selección de trabajadores
// con búsqueda y agrupación por área

'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Users, Building2, X, Check } from 'lucide-react';

interface User {
  id_usuario: string;
  nombres: string;
  apellidos: string;
  dni: string;
  correo: string;
  telefono?: string;
  area?: {
    id_area: string;
    nombre: string;
  };
  nombre_completo?: string;
}

interface WorkerSelectorProps {
  workers: User[];
  selectedWorkerId: string;
  onSelect: (workerId: string) => void;
  error?: string;
  required?: boolean;
}

const WorkerSelector: React.FC<WorkerSelectorProps> = ({
  workers,
  selectedWorkerId,
  onSelect,
  error,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const triggerRef = useRef<HTMLDivElement>(null);
  const [menuRect, setMenuRect] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updateMenuRect = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setMenuRect({ top: rect.bottom + 8, left: rect.left, width: rect.width });
  };

  useEffect(() => {
    if (!isOpen) return;
    updateMenuRect();
    const onScrollOrResize = () => updateMenuRect();
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [isOpen]);

  // Agrupar trabajadores por área
  const workersByArea = useMemo(() => {
    const grouped = workers.reduce(
      (acc, worker) => {
        const areaName = worker.area?.nombre || 'Sin área';
        if (!acc[areaName]) {
          acc[areaName] = [];
        }
        acc[areaName].push(worker);
        return acc;
      },
      {} as Record<string, User[]>,
    );

    // Ordenar áreas alfabéticamente
    return Object.keys(grouped)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = grouped[key];
          return acc;
        },
        {} as Record<string, User[]>,
      );
  }, [workers]);

  // Filtrar trabajadores por búsqueda
  const filteredWorkers = useMemo(() => {
    if (!searchTerm.trim()) return workersByArea;

    const term = searchTerm.toLowerCase();
    const filtered: Record<string, User[]> = {};

    Object.entries(workersByArea).forEach(([area, areaWorkers]) => {
      const matches = areaWorkers.filter(
        (w) =>
          w.nombres.toLowerCase().includes(term) ||
          w.apellidos.toLowerCase().includes(term) ||
          w.dni.includes(term) ||
          w.correo.toLowerCase().includes(term) ||
          area.toLowerCase().includes(term),
      );

      if (matches.length > 0) {
        filtered[area] = matches;
      }
    });

    return filtered;
  }, [workersByArea, searchTerm]);

  const selectedWorker = workers.find((w) => w.id_usuario === selectedWorkerId);

  const handleSelect = (workerId: string) => {
    onSelect(workerId);
    setIsOpen(false);
    setSearchTerm('');
  };

  const totalResults = Object.values(filteredWorkers).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className='w-full'>
      {/* Label */}
      <label className='block text-sm font-medium text-foreground mb-2'>
        Destinatario (Trabajador)
        {required && <span className='text-red-500 ml-1'>*</span>}
      </label>

      {/* Selector Button */}
      <div className='relative' ref={triggerRef}>
        <div
          role='button'
          onClick={() => setIsOpen(!isOpen)}
          className={`
                        w-full flex items-center justify-between px-4 py-3
                        border rounded-lg bg-input text-foreground transition-colors
                        ${error ? 'border-red-500' : 'border-border'}
                        ${isOpen ? 'border-primary ring-2 ring-primary' : ''}
                        hover:border-primary
                    `}
        >
          {selectedWorker ? (
            <div className='flex items-center gap-3 flex-1 text-left'>
              <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                <Users className='w-5 h-5 text-blue-600' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium text-foreground truncate'>
                  {selectedWorker.apellidos}, {selectedWorker.nombres}
                </p>
                <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                  <Building2 className='w-3 h-3' />
                  <span className='truncate'>{selectedWorker.area?.nombre}</span>
                  <span>•</span>
                  <span>DNI: {selectedWorker.dni}</span>
                </div>
              </div>
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect('');
                }}
                className='p-1 rounded hover:bg-muted'
              >
                <X className='w-4 h-4 text-muted-foreground' />
              </button>
            </div>
          ) : (
            <span className='text-muted-foreground'>Seleccione un trabajador...</span>
          )}
        </div>

        {/* Dropdown */}
        {isOpen && menuRect && (
          <>
            {createPortal(
              <div className='fixed inset-0 z-[1000]' onClick={() => setIsOpen(false)} />,
              document.body,
            )}
            {createPortal(
              <div
                className='fixed z-[1001] bg-card border border-border rounded-lg shadow-lg max-h-96 flex flex-col'
                style={{ top: menuRect.top, left: menuRect.left, width: menuRect.width }}
              >
                <div className='p-3 border-b border-border'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400' />
                    <input
                      type='text'
                      placeholder='Buscar por nombre, DNI, correo, área...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className='w-full pl-10 pr-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary bg-input text-foreground'
                      autoFocus
                    />
                  </div>
                  <p className='text-xs text-muted-foreground mt-2'>
                    {totalResults} trabajador{totalResults !== 1 ? 'es' : ''} encontrado
                    {totalResults !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className='overflow-y-auto flex-1'>
                  {totalResults === 0 ? (
                    <div className='p-8 text-center text-muted-foreground'>
                      <Users className='w-12 h-12 mx-auto mb-3 text-muted-foreground' />
                      <p className='text-sm'>No se encontraron trabajadores</p>
                      <p className='text-xs mt-1'>Intente con otros términos de búsqueda</p>
                    </div>
                  ) : (
                    <div className='py-2'>
                      {Object.entries(filteredWorkers).map(([area, areaWorkers]) => (
                        <div key={area}>
                          <div className='px-4 py-2 bg-muted border-b border-border sticky top-0'>
                            <div className='flex items-center gap-2 text-xs font-medium text-foreground'>
                              <Building2 className='w-4 h-4' />
                              <span>{area}</span>
                              <span className='text-muted-foreground'>({areaWorkers.length})</span>
                            </div>
                          </div>
                          {areaWorkers.map((worker) => {
                            const isSelected = worker.id_usuario === selectedWorkerId;
                            return (
                              <button
                                key={worker.id_usuario}
                                type='button'
                                onClick={() => handleSelect(worker.id_usuario)}
                                className={`
                                                                  w-full px-4 py-3 flex items-center gap-3
                                                                  transition-colors hover:bg-muted
                                                                  ${isSelected ? 'bg-muted' : ''}
                                                              `}
                              >
                                <div className='w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0'>
                                  <Users className='w-5 h-5 text-blue-600' />
                                </div>
                                <div className='flex-1 text-left min-w-0'>
                                  <p className='text-sm font-medium text-foreground truncate'>
                                    {worker.apellidos}, {worker.nombres}
                                  </p>
                                  <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                    <span>DNI: {worker.dni}</span>
                                    <span>•</span>
                                    <span className='truncate'>{worker.correo}</span>
                                  </div>
                                </div>
                                {isSelected && (
                                  <Check className='w-5 h-5 text-primary flex-shrink-0' />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>,
              document.body,
            )}
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className='mt-2 text-sm text-red-600 flex items-center gap-1'>
          <X className='w-4 h-4' />
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && (
        <p className='mt-2 text-sm text-muted-foreground'>
          {workers.length} trabajador{workers.length !== 1 ? 'es' : ''} disponible
          {workers.length !== 1 ? 's' : ''} en todas las áreas
        </p>
      )}
    </div>
  );
};

export default WorkerSelector;
