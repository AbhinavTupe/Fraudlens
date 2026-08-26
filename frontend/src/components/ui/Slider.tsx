import { cn } from '../../utils/cn';

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (next: number) => void;
  displayValue: string;
  hint?: string;
  tone?: 'emerald' | 'amber' | 'red' | 'blue';
}

const toneText = {
  emerald: 'text-emerald-600',
  amber: 'text-amber-600',
  red: 'text-red-600',
  blue: 'text-blue-600'
};

const toneTrack = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500'
};

/** Labelled range control shared by every simulator so they behave identically. */
export function Slider({
  id,
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  displayValue,
  hint,
  tone = 'emerald'
}: SliderProps) {
  const pct = (value - min) / (max - min || 1) * 100;
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-[13px] font-medium text-gray-700">
          {label}
        </label>
        <span className={cn('tabular text-sm font-semibold', toneText[tone])}>{displayValue}</span>
      </div>
      <div className="relative">
        <div className="pointer-events-none absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-gray-200">
          <div className={cn('h-full rounded-full', toneTrack[tone])} style={{ width: `${pct}%` }} />
        </div>
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-valuetext={displayValue}
          className={cn('relative w-full cursor-pointer bg-transparent', toneText[tone])} />
        
      </div>
      {hint ? <p className="mt-2 text-xs leading-5 text-gray-500">{hint}</p> : null}
    </div>);

}