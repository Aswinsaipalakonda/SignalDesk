import React from 'react';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  eyebrow,
  title,
  description,
  actions,
}) => {
  return (
    <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <div className="eyebrow mb-3">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
          {eyebrow || 'SignalDesk'}
        </div>
        <h1 className="font-display text-[30px] font-bold leading-[1.15] tracking-[-0.03em] text-ink md:text-[36px]">
          {title}
        </h1>
        {description && (
          <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted md:text-sm">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2.5">{actions}</div>}
    </div>
  );
};
