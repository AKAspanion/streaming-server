import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { buttonVariant } from "./button";
import { ArrowLeftIcon } from "@heroicons/react/20/solid";

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
      <div
        className="w-screen p-4 flex gap-4 justify-between"
        style={{ "--max-wasd": "calc(100vw - 160px)" } as React.CSSProperties}
      >
        <div className="test-white flex items-center gap-2 w-[var(--max-wasd)]">
          <Link to="/" className="w-5">
            <ArrowLeftIcon className="test-white w-5" />
          </Link>
          <div className="text-md overflow-hidden overflow-ellipsis whitespace-nowrap">
            {name}
          </div>
        </div>
        <Link to="/video-upload" {...buttonVariant()}>
          Upload
        </Link>
      </div>
    </div>
  );
}
