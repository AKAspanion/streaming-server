import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

let lazyTimeout: number;
export default function LazyHeader() {
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
      className="fixed visible  z-40 transition-all"
      style={{ opacity: `${visible ? 1 : 0}` }}
    >
      <div className="w-screen p-4 flex gap-4 justify-between">
        <Link to="/" className="test-white">
          <h1 className="test-white">Video Streaming Server</h1>
        </Link>
        <Link to="/video-upload">Upload</Link>
      </div>
    </div>
  );
}
