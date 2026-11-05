import React from 'react';
import { motion } from 'framer-motion';
import {
  FiAlertTriangle,
  FiCreditCard,
  FiHeadphones,
  FiInbox,
  FiTarget,
  FiTrendingUp,
} from 'react-icons/fi';
import { KpiMetric } from '../../types';
import { AnimatedNumber } from '../ui/AnimatedNumber';

interface KpiCardsProps {
  metrics: KpiMetric[];
}

const THEMES: Record<
  string,
  { icon: React.ReactNode; chip: string; accent: string; bar: string }
> = {
  ticket: {
    icon: <FiInbox size={17} />,
    chip: 'bg-brand-50 text-brand-600',
    accent: 'text-brand-600',
    bar: 'from-brand-400 to-brand-600',
  },
  'credit-card': {
    icon: <FiCreditCard size={17} />,
    chip: 'bg-sky-50 text-sky-600',
    accent: 'text-sky-600',
    bar: 'from-sky-400 to-sky-600',
  },
  headphones: {
    icon: <FiHeadphones size={17} />,
    chip: 'bg-mint-50 text-mint-600',
    accent: 'text-mint-600',
    bar: 'from-mint-400 to-mint-600',
  },
  'alert-triangle': {
    icon: <FiAlertTriangle size={17} />,
    chip: 'bg-rose-50 text-rose-600',
    accent: 'text-rose-600',
    bar: 'from-rose-400 to-rose-600',
  },
  target: {
    icon: <FiTarget size={17} />,
    chip: 'bg-amber-50 text-amber-600',
    accent: 'text-amber-600',
    bar: 'from-amber-400 to-amber-600',
  },
};

export const KpiCards: React.FC<KpiCardsProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      {metrics.map((metric, index) => {
        const theme = THEMES[metric.icon] || THEMES.ticket;
        const isPercent = metric.title === 'Model Accuracy';
        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.04 }}
            className="card card-pad group relative overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-float"
            title={metric.description}
          >
            <div
              className={`absolute inset-x-5 top-0 h-0.5 rounded-full bg-gradient-to-r ${theme.bar} opacity-0 transition-opacity group-hover:opacity-100`}
            />
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.chip}`}>
                {theme.icon}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-mint-50 px-2 py-1 text-[10px] font-semibold text-mint-600">
                <FiTrendingUp size={10} />
                Live
              </span>
            </div>

            <div className="mt-5 text-[12px] font-medium text-ink-muted">{metric.title}</div>
            <div className="mt-1 font-display text-[28px] font-bold leading-none tracking-[-0.03em] text-ink">
              <AnimatedNumber
                value={metric.numeric_value}
                decimals={isPercent ? 1 : 0}
                suffix={isPercent ? '%' : ''}
              />
            </div>
            <div className={`mt-3 truncate text-[11px] font-medium ${theme.accent}`}>
              {metric.trend}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
