import { useEffect, useRef, useState } from 'react';

export function useAnimatedCounter(
  target: number,
  duration: number = 1500,
  shouldAnimate: boolean = true
) {
  const [count, setCount] = useState(0);
  const startTime = useRef<number | null>(null);
  const frameRef = useRef<number>(null);

  useEffect(() => {
    if (!shouldAnimate) {
      setCount(target);
      return;
    }

    startTime.current = null;
    const startValue = 0;

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const elapsed = timestamp - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (target - startValue) * eased);
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(target);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [target, duration, shouldAnimate]);

  return count;
}
