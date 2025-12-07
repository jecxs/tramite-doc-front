'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, FileText, Filter } from 'lucide-react';
import Button from '@/components/ui/Button';
import { ProcedureFilters, DocumentType, User } from '@/types';
import { getDocumentTypes } from '@/lib/api/document-type';
import { getWorkers } from '@/lib/api/usuarios';

interface TramitesAdvancedFiltersProps {
  onApplyFilters: (filters: ProcedureFilters) => void;
  currentFilters?: ProcedureFilters;
  isOpen: boolean;
}

export default function TramitesAdvancedFilters({
  onApplyFilters,
  currentFilters = {},
  isOpen,
}: TramitesAdvancedFiltersProps) {
  // Estados para filtros avanzados
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
  const [esReenvio, setEsReenvio] = useState<boolean | undefined>(currentFilters.es_reenvio);
  const [ordenarPor, setOrdenarPor] = useState<string>(currentFilters.ordenar_por || 'fecha_envio');
  const [orden, setOrden] = useState<'asc' | 'desc'>(currentFilters.orden || 'desc');

  // Datos para selects
  const [tiposDocumento, setTiposDocumento] = useState<DocumentType[]>([]);
  const [trabajadores, setTrabajadores] = useState<User[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadFilterOptions();
    }
  }, [isOpen]);

  const loadFilterOptions = async () => {
    setLoadingOptions(true);
    try {
      const [tipos, workers] = await Promise.all([getDocumentTypes(), getWorkers()]);
      setTiposDocumento(tipos);
      setTrabajadores(workers);
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const handleApply = () => {
    const advancedFilters: Partial<ProcedureFilters> = {
      ...currentFilters, // Mantener filtros básicos
    };

    if (selectedTipoDocumento) advancedFilters.id_tipo_documento = selectedTipoDocumento;
    if (selectedReceptor) advancedFilters.id_receptor = selectedReceptor;
    if (fechaEnvioDesde) advancedFilters.fecha_envio_desde = fechaEnvioDesde;
    if (fechaEnvioHasta) advancedFilters.fecha_envio_hasta = fechaEnvioHasta;
    if (tieneObservaciones !== undefined) advancedFilters.tiene_observaciones = tieneObservaciones;
    if (observacionesPendientes !== undefined)
      advancedFilters.observaciones_pendientes = observacionesPendientes;
    if (conRespuesta !== undefined) advancedFilters.con_respuesta = conRespuesta;
    if (esReenvio !== undefined) advancedFilters.es_reenvio = esReenvio;

    advancedFilters.ordenar_por = ordenarPor as any;
    advancedFilters.orden = orden;

    onApplyFilters(advancedFilters as ProcedureFilters);
  };

  if (!isOpen) return null;

  return (
    <div className='bg-gray-50 border border-gray-200 rounded-lg p-6'>
      <div className='flex items-center gap-2 mb-4'>
        <Filter className='w-5 h-5 text-gray-700' />
        <h3 className='font-semibold text-gray-900'>Filtros Avanzados</h3>
      </div>

      {loadingOptions ? (
        <div className='text-center py-8'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto'></div>
          <p className='text-sm text-gray-600 mt-2'>Cargando opciones...</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Tipo de Documento */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
              <FileText className='w-4 h-4' />
              Tipo de Documento
            </label>
            <select
              value={selectedTipoDocumento}
              onChange={(e) => setSelectedTipoDocumento(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
            >
              <option value=''>Todos los tipos</option>
              {tiposDocumento.map((tipo) => (
                <option key={tipo.id_tipo} value={tipo.id_tipo}>
                  {tipo.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Trabajador (Receptor) */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
              <Users className='w-4 h-4' />
              Trabajador
            </label>
            <select
              value={selectedReceptor}
              onChange={(e) => setSelectedReceptor(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
            >
              <option value=''>Todos los trabajadores</option>
              {trabajadores.map((trabajador) => (
                <option key={trabajador.id_usuario} value={trabajador.id_usuario}>
                  {trabajador.apellidos}, {trabajador.nombres}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Desde */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
              <Calendar className='w-4 h-4' />
              Fecha Desde
            </label>
            <input
              type='date'
              value={fechaEnvioDesde}
              onChange={(e) => setFechaEnvioDesde(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
            />
          </div>

          {/* Fecha Hasta */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2'>
              <Calendar className='w-4 h-4' />
              Fecha Hasta
            </label>
            <input
              type='date'
              value={fechaEnvioHasta}
              onChange={(e) => setFechaEnvioHasta(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Observaciones</label>
            <select
              value={observacionesPendientes ? 'pendientes' : tieneObservaciones ? 'con' : ''}
              onChange={(e) => {
                if (e.target.value === 'pendientes') {
                  setObservacionesPendientes(true);
                  setTieneObservaciones(undefined);
                } else if (e.target.value === 'con') {
                  setTieneObservaciones(true);
                  setObservacionesPendientes(undefined);
                } else {
                  setTieneObservaciones(undefined);
                  setObservacionesPendientes(undefined);
                }
              }}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
            >
              <option value=''>Todas</option>
              <option value='con'>Con observaciones</option>
              <option value='pendientes'>Pendientes</option>
            </select>
          </div>

          {/* Respuesta de Conformidad */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Respuesta</label>
            <select
              value={conRespuesta === undefined ? '' : String(conRespuesta)}
              onChange={(e) =>
                setConRespuesta(e.target.value === '' ? undefined : e.target.value === 'true')
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
            >
              <option value=''>Todas</option>
              <option value='true'>Con respuesta</option>
              <option value='false'>Sin respuesta</option>
            </select>
          </div>

          {/* Tipo de Envío */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Tipo de Envío</label>
            <select
              value={esReenvio === undefined ? '' : String(esReenvio)}
              onChange={(e) =>
                setEsReenvio(e.target.value === '' ? undefined : e.target.value === 'true')
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
            >
              <option value=''>Todos</option>
              <option value='true'>Reenvíos</option>
              <option value='false'>Envíos originales</option>
            </select>
          </div>

          {/* Ordenar Por */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Ordenar por</label>
            <select
              value={ordenarPor}
              onChange={(e) => setOrdenarPor(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
            >
              <option value='fecha_envio'>Fecha envío</option>
              <option value='fecha_leido'>Fecha lectura</option>
              <option value='fecha_firmado'>Fecha firma</option>
              <option value='asunto'>Asunto</option>
              <option value='codigo'>Código</option>
              <option value='estado'>Estado</option>
            </select>
          </div>

          {/* Orden */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>Orden</label>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value as 'asc' | 'desc')}
              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white'
            >
              <option value='desc'>Descendente</option>
              <option value='asc'>Ascendente</option>
            </select>
          </div>
        </div>
      )}

      {/* Botón para aplicar */}
      <div className='flex justify-end mt-4 pt-4 border-t border-gray-200'>
        <Button type='button' onClick={handleApply} disabled={loadingOptions}>
          Aplicar filtros avanzados
        </Button>
      </div>
    </div>
  );
}
