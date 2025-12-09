// src/components/tramites/TramitesFilters.tsx
'use client';

import { useState, useEffect } from 'react';
import { Search, X, Calendar, Users, FileText, SlidersHorizontal } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ProcedureFilters, User, DocumentType } from '@/types';
import { PROCEDURE_STATE_LABELS, PROCEDURE_STATES } from '@/lib/constants';
import { getWorkers } from '@/lib/api/usuarios';
import { getDocumentTypes } from '@/lib/api/document-type';
import { useRole } from '@/contexts/AuthContext';

interface TramitesFiltersProps {
  onApplyFilters: (filters: ProcedureFilters) => void;
  onClearFilters?: () => void;
  currentFilters?: ProcedureFilters;
}

export default function TramitesFilters({
  onApplyFilters,
  onClearFilters,
  currentFilters = {},
}: TramitesFiltersProps) {
  const { isAdmin, isResponsible } = useRole();
  const canFilterWorkers = isAdmin || isResponsible;
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState(currentFilters.search || '');

  // Filtros básicos
  const [selectedEstado, setSelectedEstado] = useState<string>(currentFilters.estado || '');
  const [requiereFirma, setRequiereFirma] = useState<boolean | undefined>(
    currentFilters.requiere_firma,
  );
  const [esReenvio, setEsReenvio] = useState<boolean | undefined>(currentFilters.es_reenvio);

  // ✅ NUEVOS FILTROS
  const [selectedTipoDocumento, setSelectedTipoDocumento] = useState<string>(
    currentFilters.id_tipo_documento || '',
  );
  const [selectedReceptor, setSelectedReceptor] = useState<string>(
    currentFilters.id_receptor || '',
  );
  const [fechaEnvioDesde, setFechaEnvioDesde] = useState<string>(
    currentFilters.fecha_envio_desde || '',
  );
  const [fechaEnvioHasta, setFechaEnvioHasta] = useState<string>(
    currentFilters.fecha_envio_hasta || '',
  );
  const [tieneObservaciones, setTieneObservaciones] = useState<boolean | undefined>(
    currentFilters.tiene_observaciones,
  );
  const [observacionesPendientes, setObservacionesPendientes] = useState<boolean | undefined>(
    currentFilters.observaciones_pendientes,
  );
  const [conRespuesta, setConRespuesta] = useState<boolean | undefined>(
    currentFilters.con_respuesta,
  );

  // Ordenamiento
  const [ordenarPor, setOrdenarPor] = useState<string>(currentFilters.ordenar_por || 'fecha_envio');
  const [orden, setOrden] = useState<'asc' | 'desc'>(currentFilters.orden || 'desc');

  // Datos para selects
  const [trabajadores, setTrabajadores] = useState<User[]>([]);
  const [tiposDocumento, setTiposDocumento] = useState<DocumentType[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // Cargar opciones al abrir filtros
  useEffect(() => {
    if (isOpen) {
      loadFilterOptions();
    }
  }, [isOpen]);

  const loadFilterOptions = async () => {
    setLoadingOptions(true);
    try {
      if (canFilterWorkers) {
        const workers = await getWorkers();
        setTrabajadores(workers);
        setTiposDocumento([]);
      } else {
        setTrabajadores([]);
        setTiposDocumento([]);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleApply = () => {
    const filters: ProcedureFilters = {};

    // Búsqueda
    if (search.trim()) {
      filters.search = search.trim();
    }

    // Filtros básicos
    if (selectedEstado) {
      filters.estado = selectedEstado as PROCEDURE_STATES;
    }

    if (requiereFirma !== undefined) {
      filters.requiere_firma = requiereFirma;
    }

    if (esReenvio !== undefined) {
      filters.es_reenvio = esReenvio;
    }

    // ✅ NUEVOS FILTROS
    if (selectedTipoDocumento) {
      filters.id_tipo_documento = selectedTipoDocumento;
    }

    if (canFilterWorkers && selectedReceptor) {
      filters.id_receptor = selectedReceptor;
    }

    if (fechaEnvioDesde) {
      filters.fecha_envio_desde = fechaEnvioDesde;
    }

    if (fechaEnvioHasta) {
      filters.fecha_envio_hasta = fechaEnvioHasta;
    }

    if (tieneObservaciones !== undefined) {
      filters.tiene_observaciones = tieneObservaciones;
    }

    if (observacionesPendientes !== undefined) {
      filters.observaciones_pendientes = observacionesPendientes;
    }

    if (conRespuesta !== undefined) {
      filters.con_respuesta = conRespuesta;
    }

    // Ordenamiento
    filters.ordenar_por = ordenarPor as any;
    filters.orden = orden;

    onApplyFilters(filters);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearch('');
    setSelectedEstado('');
    setRequiereFirma(undefined);
    setEsReenvio(undefined);
    setSelectedTipoDocumento('');
    setSelectedReceptor('');
    setFechaEnvioDesde('');
    setFechaEnvioHasta('');
    setTieneObservaciones(undefined);
    setObservacionesPendientes(undefined);
    setConRespuesta(undefined);
    setOrdenarPor('fecha_envio');
    setOrden('desc');

    if (onClearFilters) {
      onClearFilters();
    } else {
      onApplyFilters({});
    }
    setIsOpen(false);
  };

  const hasActiveFilters =
    search ||
    selectedEstado ||
    requiereFirma !== undefined ||
    esReenvio !== undefined ||
    selectedTipoDocumento ||
    (canFilterWorkers && selectedReceptor) ||
    fechaEnvioDesde ||
    fechaEnvioHasta ||
    tieneObservaciones !== undefined ||
    observacionesPendientes !== undefined ||
    conRespuesta !== undefined;

  const activeFiltersCount = [
    search,
    selectedEstado,
    requiereFirma !== undefined,
    esReenvio !== undefined,
    selectedTipoDocumento,
    canFilterWorkers && selectedReceptor,
    fechaEnvioDesde || fechaEnvioHasta,
    tieneObservaciones !== undefined,
    observacionesPendientes !== undefined,
    conRespuesta !== undefined,
  ].filter(Boolean).length;

  return (
    <div className='relative'>
      {/* Search Bar */}
      <div className='flex gap-3'>
        <div className='flex-1 relative'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground' />
          <input
            type='text'
            placeholder='Buscar por código o asunto...'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            className='w-full pl-10 pr-4 py-2.5 bg-input border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/50 focus:border-primary'
          />
        </div>

        <Button
          type='button'
          variant={hasActiveFilters ? 'primary' : 'outline'}
          onClick={() => setIsOpen(!isOpen)}
        >
          <SlidersHorizontal className='w-4 h-4' />
          Filtros
          {activeFiltersCount > 0 && (
            <span className='ml-1 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold'>
              {activeFiltersCount}
            </span>
          )}
        </Button>
      </div>

      {/* Filters Panel */}
      {isOpen && (
        <>
          <div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />

          <div className='absolute right-0 mt-2 w-96 bg-card border border-border rounded-lg shadow-lg z-20 max-h-[80vh] flex flex-col'>
            {/* Header */}
            <div className='p-4 border-b border-border flex-shrink-0'>
              <div className='flex items-center justify-between'>
                <h3 className='font-semibold text-foreground'>Filtros Avanzados</h3>
                <button onClick={() => setIsOpen(false)} className='p-1 rounded hover:bg-muted'>
                  <X className='w-4 h-4 text-muted-foreground' />
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className='p-4 space-y-6 overflow-y-auto flex-1'>
              {loadingOptions && (
                <div className='text-center py-4'>
                  <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                  <p className='text-sm text-muted-foreground mt-2'>Cargando opciones...</p>
                </div>
              )}

              {!loadingOptions && (
                <>
                  {/* Estado */}
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-2'>Estado</label>
                    <select
                      value={selectedEstado}
                      onChange={(e) => setSelectedEstado(e.target.value)}
                      className='w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary'
                    >
                      <option value=''>Todos los estados</option>
                      {Object.entries(PROCEDURE_STATE_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* ✅ NUEVO: Tipo de Documento */}
                  {canFilterWorkers && (
                    <div>
                      <label className='block text-sm font-medium text-foreground mb-2 flex items-center gap-2'>
                        <FileText className='w-4 h-4' />
                        Tipo de Documento
                      </label>
                      <select
                        value={selectedTipoDocumento}
                        onChange={(e) => setSelectedTipoDocumento(e.target.value)}
                        className='w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary'
                      >
                        <option value=''>Todos los tipos</option>
                        {tiposDocumento.map((tipo) => (
                          <option key={tipo.id_tipo} value={tipo.id_tipo}>
                            {tipo.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* ✅ Trabajador (solo Admin o Responsable) */}
                  {canFilterWorkers && (
                    <div>
                      <label className='block text-sm font-medium text-foreground mb-2 flex items-center gap-2'>
                        <Users className='w-4 h-4' />
                        Trabajador
                      </label>
                      <select
                        value={selectedReceptor}
                        onChange={(e) => setSelectedReceptor(e.target.value)}
                        className='w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary'
                      >
                        <option value=''>Todos los trabajadores</option>
                        {trabajadores.map((trabajador) => (
                          <option key={trabajador.id_usuario} value={trabajador.id_usuario}>
                            {trabajador.apellidos}, {trabajador.nombres}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* ✅ NUEVO: Rango de Fechas de Envío */}
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-2 flex items-center gap-2'>
                      <Calendar className='w-4 h-4' />
                      Fecha de Envío
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                      <div>
                        <label className='block text-xs text-muted-foreground mb-1'>Desde</label>
                        <input
                          type='date'
                          value={fechaEnvioDesde}
                          onChange={(e) => setFechaEnvioDesde(e.target.value)}
                          className='w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm text-foreground'
                        />
                      </div>
                      <div>
                        <label className='block text-xs text-muted-foreground mb-1'>Hasta</label>
                        <input
                          type='date'
                          value={fechaEnvioHasta}
                          onChange={(e) => setFechaEnvioHasta(e.target.value)}
                          className='w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm text-foreground'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Requiere Firma */}
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-2'>
                      Requiere Firma
                    </label>
                    <div className='space-y-2'>
                      {[
                        { value: undefined, label: 'Todos' },
                        { value: true, label: 'Sí requiere firma' },
                        { value: false, label: 'No requiere firma' },
                      ].map((option) => (
                        <button
                          key={String(option.value)}
                          type='button'
                          onClick={() => setRequiereFirma(option.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                            requiereFirma === option.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✅ NUEVO: Observaciones */}
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-2'>
                      Observaciones
                    </label>
                    <div className='space-y-2'>
                      <button
                        type='button'
                        onClick={() => {
                          setTieneObservaciones(undefined);
                          setObservacionesPendientes(undefined);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                          tieneObservaciones === undefined && observacionesPendientes === undefined
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        Todos
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          setTieneObservaciones(true);
                          setObservacionesPendientes(undefined);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                          tieneObservaciones === true && observacionesPendientes === undefined
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        Con observaciones
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          setTieneObservaciones(undefined);
                          setObservacionesPendientes(true);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                          observacionesPendientes === true
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-muted'
                        }`}
                      >
                        Con observaciones pendientes
                      </button>
                    </div>
                  </div>

                  {/* ✅ NUEVO: Con Respuesta */}
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-2'>
                      Respuesta de Conformidad
                    </label>
                    <div className='space-y-2'>
                      {[
                        { value: undefined, label: 'Todos' },
                        { value: true, label: 'Con respuesta' },
                        { value: false, label: 'Sin respuesta' },
                      ].map((option) => (
                        <button
                          key={String(option.value)}
                          type='button'
                          onClick={() => setConRespuesta(option.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                            conRespuesta === option.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tipo de Envío */}
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-2'>
                      Tipo de Envío
                    </label>
                    <div className='space-y-2'>
                      {[
                        { value: undefined, label: 'Todos' },
                        { value: true, label: 'Solo reenvíos' },
                        { value: false, label: 'Solo envíos originales' },
                      ].map((option) => (
                        <button
                          key={String(option.value)}
                          type='button'
                          onClick={() => setEsReenvio(option.value)}
                          className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                            esReenvio === option.value
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:bg-muted'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ✅ NUEVO: Ordenamiento */}
                  <div>
                    <label className='block text-sm font-medium text-foreground mb-2'>
                      Ordenar por
                    </label>
                    <div className='grid grid-cols-2 gap-2'>
                      <select
                        value={ordenarPor}
                        onChange={(e) => setOrdenarPor(e.target.value)}
                        className='px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm text-foreground'
                      >
                        <option value='fecha_envio'>Fecha envío</option>
                        <option value='fecha_leido'>Fecha lectura</option>
                        <option value='fecha_firmado'>Fecha firma</option>
                        <option value='asunto'>Asunto</option>
                        <option value='codigo'>Código</option>
                        <option value='estado'>Estado</option>
                      </select>
                      <select
                        value={orden}
                        onChange={(e) => setOrden(e.target.value as 'asc' | 'desc')}
                        className='px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm text-foreground'
                      >
                        <option value='desc'>Descendente</option>
                        <option value='asc'>Ascendente</option>
                      </select>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className='p-4 border-t border-border flex gap-3 flex-shrink-0'>
              <Button type='button' variant='outline' onClick={handleClear} className='flex-1'>
                Limpiar
              </Button>
              <Button type='button' onClick={handleApply} className='flex-1'>
                Aplicar
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
