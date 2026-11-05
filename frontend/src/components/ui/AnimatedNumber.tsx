import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';
import { formatNumber } from '../../lib/format';

interface AnimatedNumberProps {
  value: number;
  decimals?: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  decimals = 0,
  suffix = '',
  prefix = '',
  duration = 0.9,
  className,
}) => {
  const [display, setDisplay] = useState(0);
  const previous = useRef(0);

  useEffect(() => {
    const controls = animate(previous.current, value, {
      duration,
      ease: 'easeOut',
      onUpdate: (latest) => setDisplay(latest),
      onComplete: () => setDisplay(value),
    });
    previous.current = value;
    return () => controls.stop();
  }, [value, duration]);

  return (
    <span className={className}>
      {prefix}
      {formatNumber(display, decimals)}
      {suffix}
    </span>
  );
};
