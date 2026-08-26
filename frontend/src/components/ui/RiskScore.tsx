import { cn } from '../../utils/cn';
import { bandMeta, riskBand } from '../../utils/labels';

interface RiskScoreProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showBar?: boolean;
  className?: string;
}

export function RiskScore({ score, size = 'sm', showBar = true, className }: RiskScoreProps) {
  const band = riskBand(score);
  const meta = bandMeta[band];

  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'tabular font-semibold tracking-tight',
          meta.text,
          size === 'sm' && 'text-[13px]',
          size === 'md' && 'text-base',
          size === 'lg' && 'text-3xl'
        )}>
        
        {score}
        {size === 'lg' ? <span className="ml-1 text-base font-medium text-gray-400">/100</span> : null}
      </span>
      {showBar ?
      <span
        className={cn('relative overflow-hidden rounded-full bg-gray-100', size === 'lg' ? 'h-2 w-full' : 'h-1.5 w-14')}
        role="img"
        aria-label={`${meta.label}, score ${score} of 100`}>
        
          <span
          className={cn('absolute inset-y-0 left-0 rounded-full transition-all duration-500', meta.bar)}
          style={{ width: `${score}%` }} />
        
        </span> :
      null}
    </div>);

}