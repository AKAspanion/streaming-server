type ProgressProps = {
  value: number;
};

function Progress(props: ProgressProps) {
  const { value } = props;
  return (
    <div className="h-1 w-full bg-slate-900 transition-all">
      <div className="h-1 bg-green-600" style={{ width: `${value}%` }}></div>
    </div>
  );
}

export default Progress;
