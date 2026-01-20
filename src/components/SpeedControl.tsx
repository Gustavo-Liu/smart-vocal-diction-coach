'use client';

import * as Slider from '@radix-ui/react-slider';

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export default function SpeedControl({ speed, onSpeedChange }: SpeedControlProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          播放速度
        </label>
        <span className="text-sm font-mono text-blue-600 dark:text-blue-400">
          {speed.toFixed(1)}x
        </span>
      </div>
      <Slider.Root
        className="relative flex items-center select-none touch-none w-full h-5"
        value={[speed]}
        onValueChange={(value) => onSpeedChange(value[0])}
        min={0.1}
        max={1.0}
        step={0.1}
      >
        <Slider.Track className="bg-gray-200 dark:bg-gray-700 relative grow rounded-full h-2">
          <Slider.Range className="absolute bg-blue-600 dark:bg-blue-500 rounded-full h-full" />
        </Slider.Track>
        <Slider.Thumb className="block w-5 h-5 bg-white dark:bg-gray-300 shadow-md rounded-full hover:bg-blue-50 dark:hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" />
      </Slider.Root>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>0.1x (最慢)</span>
        <span>1.0x (正常)</span>
      </div>
    </div>
  );
}
