import { CheckCircle, FileCheck, FileX, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface DetectionSummaryProps {
  exitososCount: number;
  fallidosCount: number;
  listosCount: number;
}

export default function DetectionSummary({
                                           exitososCount,
                                           fallidosCount,
                                           listosCount,
                                         }: DetectionSummaryProps) {
  const stats = [
    {
      label: 'Detectados',
      value: exitososCount,
      icon: FileCheck,
      color: 'text-emerald-300',
      bgColor: 'bg-emerald-500/15',
      borderColor: 'border-emerald-400/30',
      iconBg: 'bg-emerald-500/20',
    },
    {
      label: 'Fallidos',
      value: fallidosCount,
      icon: FileX,
      color: 'text-red-300',
      bgColor: 'bg-red-500/15',
      borderColor: 'border-red-400/30',
      iconBg: 'bg-red-500/20',
    },
    {
      label: 'Listos',
      value: listosCount,
      icon: Send,
      color: 'text-blue-300',
      bgColor: 'bg-blue-500/15',
      borderColor: 'border-blue-400/30',
      iconBg: 'bg-blue-500/20',
    },
  ];

  return (
    <Card className='bg-gradient-to-br from-[#2A2D3A]/60 to-[#2A2D3A]/40 border-[#3D4153]/60 backdrop-blur-md shadow-2xl overflow-hidden'>
      <div className='bg-gradient-to-br from-emerald-500/5 via-green-500/5 to-teal-500/5'>
        <CardHeader className='pb-4 border-b border-[#3D4153]/40'>
          <CardTitle className='text-base flex items-center gap-3'>
            <div className='w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-400/20'>
              <CheckCircle className='w-5 h-5 text-emerald-300' />
            </div>
            <span className='font-medium text-white'>Detección Completa</span>
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-6 pb-6'>
          <div className='grid grid-cols-3 gap-4'>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`
                    relative group
                    p-5 rounded-xl
                    ${stat.bgColor} border ${stat.borderColor}
                    hover:bg-opacity-80
                    transition-all duration-300
                    hover:scale-[1.02]
                  `}
                >
                  {/* Icono decorativo */}
                  <div
                    className={`
                      absolute top-3 right-3
                      w-9 h-9 rounded-lg ${stat.iconBg}
                      flex items-center justify-center
                      border ${stat.borderColor}
                      opacity-60 group-hover:opacity-100
                      transition-opacity duration-300
                    `}
                  >
                    <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
                  </div>

                  {/* Valor */}
                  <p
                    className={`
                      text-4xl font-bold tracking-tight ${stat.color}
                      mb-2
                    `}
                  >
                    {stat.value}
                  </p>

                  {/* Label */}
                  <p className='text-sm font-medium text-gray-400'>{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </div>
    </Card>
  );
}
