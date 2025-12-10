'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  gradient: string;
  borderColor: string;
  iconColor: string;
  description?: string;
  isEmpty?: boolean;
}

export default function StatCard({
                                   label,
                                   value,
                                   icon: Icon,
                                   gradient,
                                   borderColor,
                                   iconColor,
                                   description,
                                   isEmpty = false,
                                 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-card backdrop-blur-sm border ${borderColor} rounded-2xl p-6 hover:${borderColor.replace('border-', 'border-')} transition-all duration-300 shadow-lg`}
    >
      <div className='flex items-center justify-between'>
        <div>
          <p className='text-sm text-foreground-400 mb-2'>{label}</p>
          <motion.p
            key={value}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className='text-3xl font-bold text-foreground'
          >
            {value}
          </motion.p>
          {description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='text-xs text-muted-foreground mt-2'
            >
              {description}
            </motion.p>
          )}
          {isEmpty && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className='text-xs text-muted-foreground mt-2 italic'
            >
              Sin resultados
            </motion.p>
          )}
        </div>
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.5 }}
          className={`p-4 bg-gradient-to-br ${gradient} rounded-xl`}
        >
          <Icon className={`w-7 h-7 ${iconColor}`} />
        </motion.div>
      </div>
    </motion.div>
  );
}
