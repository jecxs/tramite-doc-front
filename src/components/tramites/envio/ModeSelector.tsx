import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Users, Zap } from 'lucide-react';

type SendMode = 'individual' | 'bulk' | 'auto-lote';

interface ModeSelectorProps {
  currentMode: SendMode;
  onModeChange: (mode: SendMode) => void;
}

export default function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  const modes = [
    {
      id: 'individual' as SendMode,
      icon: Users,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-500',
      hoverBg: 'hover:bg-blue-50/50',
      title: 'Individual',
      description: 'Enviar a un trabajador',
    },
    {
      id: 'bulk' as SendMode,
      icon: Users,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-500',
      hoverBg: 'hover:bg-emerald-50/50',
      title: 'Masivo',
      description: 'Enviar a múltiples trabajadores',
    },
    {
      id: 'auto-lote' as SendMode,
      icon: Zap,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-500',
      hoverBg: 'hover:bg-amber-50/50',
      title: 'Auto-Lote',
      description: 'Detección automática por DNI',
    },
  ];

  return (
    <Card className='border-gray-200 shadow-sm'>
      <CardHeader className='space-y-1.5'>
        <CardTitle className='text-xl font-semibold tracking-tight'>Modo de Envío</CardTitle>
        <CardDescription className='text-sm text-gray-500'>
          Elija cómo desea enviar el documento
        </CardDescription>
      </CardHeader>
      <CardContent className='pt-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = currentMode === mode.id;

            return (
              <button
                key={mode.id}
                type='button'
                onClick={() => onModeChange(mode.id)}
                className={`
                                    group relative p-6 rounded-xl
                                    border-2 transition-all duration-300 ease-out
                                    ${
                                      isActive
                                        ? `${mode.borderColor} ${mode.bgColor} shadow-lg scale-[1.02]`
                                        : `border-gray-200 bg-white ${mode.hoverBg} hover:border-gray-300 hover:shadow-md`
                                    }
                                    active:scale-[0.98]
                                `}
              >
                {/* Indicator de selección */}
                {isActive && (
                  <div
                    className={`
                                        absolute top-3 right-3 w-2 h-2 rounded-full
                                        ${mode.iconColor.replace('text-', 'bg-')}
                                        animate-pulse
                                    `}
                  />
                )}

                {/* Icono */}
                <div
                  className={`
                                    w-12 h-12 mx-auto mb-4 rounded-lg
                                    flex items-center justify-center
                                    transition-transform duration-300
                                    ${isActive ? mode.bgColor : 'bg-gray-50'}
                                    ${!isActive && 'group-hover:scale-110'}
                                `}
                >
                  <Icon
                    className={`
                                        w-6 h-6 transition-colors duration-300
                                        ${mode.iconColor}
                                    `}
                  />
                </div>

                {/* Texto */}
                <div className='space-y-1'>
                  <p
                    className={`
                                        font-semibold text-base transition-colors duration-300
                                        ${isActive ? 'text-gray-900' : 'text-gray-700'}
                                    `}
                  >
                    {mode.title}
                  </p>
                  <p
                    className={`
                                        text-sm transition-colors duration-300
                                        ${isActive ? 'text-gray-600' : 'text-gray-500'}
                                    `}
                  >
                    {mode.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
