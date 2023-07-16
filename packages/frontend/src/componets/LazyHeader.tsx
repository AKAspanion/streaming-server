import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buttonVariant } from "./button";

let lazyTimeout: NodeJS.Timeout;
export default function LazyHeader(props: { name?: string }) {
  const { name } = props;
  const [visible, setVisible] = useState(true);

  const lazyHide = () => {
    clearTimeout(lazyTimeout);
    lazyTimeout = setTimeout(() => {
      setVisible(false);
    }, 5000);
  };

  useEffect(() => {
    document.addEventListener("mousemove", (e) => {
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
        <Link to="/video-upload" {...buttonVariant()}>
          Upload
        </Link>
      </div>
    </div>
  );
}
