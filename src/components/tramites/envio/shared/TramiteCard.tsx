import {Trash2, GripVertical, Users} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import { DocumentoConDestinatarioDto } from '@/types';

interface TramiteCardProps {
    tramites: DocumentoConDestinatarioDto[];
    onEdit: (index: number, field: keyof DocumentoConDestinatarioDto, value: string) => void;
    onDelete: (index: number) => void;
}

export default function TramiteCard({ tramites, onEdit, onDelete }: TramiteCardProps) {
    return (
        <Card className="border-gray-200 shadow-sm">
            <CardHeader className="space-y-1.5 border-b border-gray-100 bg-gradient-to-br from-slate-50 to-gray-50">
                <CardTitle className="text-xl font-semibold tracking-tight">
                    Paso 2: Revisar y Enviar
                </CardTitle>
                <CardDescription className="text-sm text-gray-500">
                    Revise los datos generados automáticamente. Puede editarlos antes de enviar.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {tramites.map((tramite, index) => (
                        <div
                            key={index}
                            className="
                                group relative
                                border border-gray-200 rounded-xl p-5
                                bg-white hover:border-blue-200 hover:shadow-md
                                transition-all duration-300 ease-out
                            "
                        >
                            {/* Grip indicator (visual drag handle) */}
                            <div className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 transition-opacity">
                                <GripVertical className="w-4 h-4 text-gray-400" />
                            </div>

                            {/* Header con info del trabajador */}
                            <div className="flex items-start justify-between mb-4 pl-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                        <p className="font-semibold text-gray-900 truncate">
                                            {tramite.nombre_trabajador}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                        <span className="inline-flex items-center gap-1.5">
                                            <span className="font-medium text-gray-700">DNI:</span>
                                            {tramite.dni}
                                        </span>
                                        <span className="text-gray-300">•</span>
                                        <span className="truncate">{tramite.nombre_archivo}</span>
                                    </div>
                                </div>

                                {/* Botón eliminar mejorado */}
                                <button
                                    type="button"
                                    onClick={() => onDelete(index)}
                                    className="
                                        flex-shrink-0 ml-3
                                        p-2 rounded-lg
                                        text-gray-400 hover:text-red-600
                                        hover:bg-red-50
                                        transition-all duration-200
                                        active:scale-95
                                    "
                                    title="Eliminar de la lista"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Divider sutil */}
                            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4" />

                            {/* Campos editables */}
                            <div className="space-y-4 pl-3">
                                <Input
                                    label="Asunto"
                                    value={tramite.asunto}
                                    onChange={(e) => onEdit(index, 'asunto', e.target.value)}
                                    maxLength={255}
                                    className="transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-100"
                                />

                                <Textarea
                                    label="Mensaje"
                                    value={tramite.mensaje || ''}
                                    onChange={(e) => onEdit(index, 'mensaje', e.target.value)}
                                    rows={2}
                                    maxLength={500}
                                    className="transition-all duration-200 focus-within:ring-2 focus-within:ring-blue-100"
                                />
                            </div>
                        </div>
                    ))}

                    {/* Empty state si no hay trámites */}
                    {tramites.length === 0 && (
                        <div className="text-center py-12 px-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                <Users className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-gray-500 text-sm">
                                No hay trámites para revisar
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}