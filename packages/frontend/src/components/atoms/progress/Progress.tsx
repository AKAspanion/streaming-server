import cs from 'classnames';

type ProgressProps = {
  value: number;
  full?: boolean;
  rounded?: boolean;
};

function Progress(props: ProgressProps) {
  const { value, full, rounded } = props;
  return (
    <div
      className={cs('h-1 w-full bg-slate-200 dark:bg-slate-950 transition-all', {
        'absolute w-full h-full flex items-center justify-center': full,
        'rounded-md overflow-hidden': rounded,
      })}
    >
      <div
        className={cs({
          'w-[420px] border-4 border-slate-300': full,
          'w-full': !full,
        })}
      >
        <div className={cs('h-1 bg-green-600', { 'h-4': full })} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default Progress;
