import { useGetVideoByIdQuery } from "../../services/video";
import { baseUrl } from "../../config/api";
import { useParams } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";

import "./VideoPlay.css";
import LazyHeader from "../../componets/LazyHeader";

function VIdeoPlay() {
  const ref = useRef<HTMLVideoElement>(null);
  const { videoId } = useParams();

  if (!videoId) {
    return <div>Video ID is required to play content</div>;
  }

  const { data, error, isLoading } = useGetVideoByIdQuery(videoId);

  const srUrl = `${baseUrl}/video/stream/${videoId}`;

  // const handlePlayPause = () => {
  //   if (ref.current) {
  //     if (ref.current.paused) {
  //       ref.current.play();
  //       setBtnText("Pause");
  //     } else {
  //       ref.current.pause();
  //       setBtnText("Play");
  //     }
  //   }
  // };

  useLayoutEffect(() => {
    if (ref.current) {
      setTimeout(() => {
        ref.current?.play();
      }, 1000);

      window.addEventListener("blur", function () {
        ref.current?.pause();
      });
      window.addEventListener("focus", function () {
        ref.current?.play();
      });
    }
    return () => {
      ref.current && ref.current.pause();
    };
  }, []);

  return (
    <div>
      <LazyHeader name={data?.data?.originalname} />
      {isLoading ? (
        <div>Loading</div>
      ) : error ? (
        <div className="p-4">{JSON.stringify(error)}</div>
      ) : (
        <div>
          <video autoPlay controls ref={ref} id="myVideo">
            <source src={srUrl} type="video/mp4" />
          </video>

          {/* <div className="content">
            <h1>Heading</h1>
            <p>Lorem ipsum...</p>
            <button id="myBtn" onClick={handlePlayPause}>
              {btnText}
            </button>
          </div> */}
        </div>
      )}
    </div>
  );
}

export default VIdeoPlay;
