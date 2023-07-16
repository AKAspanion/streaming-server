import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

let lazyTimeout: number;
export default function LazyHeader(props: { name?: string }) {
  const { name } = props;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    document.addEventListener("mousemove", (e) => {
      if (e.clientY < 100) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      clearTimeout(lazyTimeout);
      lazyTimeout = setTimeout(() => {
        setVisible(false);
      }, 5000);
    });
  }, []);

  return (
    <div
      className="fixed bg-gradient-to-b from-black to-transparent  z-40 transition-all"
      style={{ opacity: `${visible ? 1 : 0}` }}
    >
      <div className="w-screen p-4 flex gap-4 justify-between">
        <div className="flex items-center gap-2">
          <Link to="/" className="test-white">
            <h1 className="test-white text-3xl">⬅️</h1>
          </Link>
          <div className="text-md">{name}</div>
        </div>
        <Link to="/video-upload" className="rounded-md bg-slate-600 px-4 py-2">
          Upload
        </Link>
      </div>
    </div>
  );
}
