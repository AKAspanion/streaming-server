import cs from 'classnames';

type ProgressProps = {
  value: number;
  full?: boolean;
};

function Progress(props: ProgressProps) {
  const { value, full } = props;
  return (
    <div
      className={cs('h-1 w-full bg-slate-950 transition-all', {
        'fixed w-screen h-screen flex items-center justify-center': full,
      })}
    >
      <div className={cs({ 'w-[300px] border-4 border-slate-300': full, 'w-full': !full })}>
        <div className={cs('h-1 bg-green-600', { 'h-4': full })} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export default Progress;
