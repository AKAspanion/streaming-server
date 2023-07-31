import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';

let lazyTimeout: NodeJS.Timeout;
export default function LazyHeader(props: { name?: string; backTo?: string }) {
  const { name, backTo = '/' } = props;
  const [visible, setVisible] = useState(true);

  const lazyHide = () => {
    clearTimeout(lazyTimeout);
    lazyTimeout = setTimeout(() => {
      setVisible(false);
    }, 5000);
  };

  useEffect(() => {
    document.addEventListener('mousemove', (e) => {
      if (e.clientY < 100) {
        setVisible(true);
        lazyHide();
      } else {
        setVisible(false);
      }
    });
  }, []);

  return (
    <div
      className="fixed top-0 left-0 bg-gradient-to-b from-black to-transparent  z-40 transition-all duration-500"
      style={{ opacity: `${visible ? 1 : 0}` }}
    >
      <div
        className="w-screen p-4 flex gap-4 justify-between"
        style={{ '--max-wasd': 'calc(100vw - 160px)' } as React.CSSProperties}
      >
        <div className="text-white flex items-center gap-2 w-[var(--max-wasd)]">
          <Link to={backTo} className="w-5">
            <ArrowLeftIcon className="text-white w-5" />
          </Link>
          <div className="text-md overflow-hidden overflow-ellipsis whitespace-nowrap">{name}</div>
        </div>
      </div>
      <div className="h-5" />
    </div>
  );
}
