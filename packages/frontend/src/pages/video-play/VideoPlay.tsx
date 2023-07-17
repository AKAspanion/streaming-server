import { useGetVideoByIdQuery } from "../../services/video";
import { baseUrl } from "../../config/api";
import { useParams } from "react-router-dom";
import { useEffect, useLayoutEffect, useRef } from "react";
import LazyHeader from "../../componets/LazyHeader";
import { useGetSubtitleByIdQuery } from "../../services/subtitle";
import Spinner from "../../componets/spinner/Spinner";

import "./VideoPlay.css";

function VIdeoPlay() {
  const ref = useRef<HTMLVideoElement>(null);
  const { videoId } = useParams();

  if (!videoId) {
    return <div>Video ID is required to play content</div>;
  }

  const { data, error, isLoading } = useGetVideoByIdQuery(videoId);
  const { data: subData, isLoading: subLoading } =
    useGetSubtitleByIdQuery(videoId);

  const srcUrl = `${baseUrl}/video/stream/${videoId}`;

  const handleSubtitleLoad = async (textTrackUrl: string) => {
    try {
      if (ref.current) {
        const track = ref.current.children[1] as HTMLTrackElement; // Track element (which is child of a video element)
        const video = ref.current as HTMLVideoElement; // Main video element

        if (track && video) {
          track.src = textTrackUrl; // Set the converted URL to track's source
          video.textTracks[0].mode = "showing"; // Start showing subtitle to your track
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (subData) {
      handleSubtitleLoad(subData);
    }
  }, [subData]);

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

  const loading = isLoading || subLoading;

  return (
    <div>
      <LazyHeader name={data?.data?.originalname} />
      {loading ? (
        <Spinner full />
      ) : error ? (
        <div className="p-4">{JSON.stringify(error)}</div>
      ) : (
        <div id="">
          <video autoPlay controls ref={ref} id="myVideo">
            <source src={srcUrl} type="video/mp4" />
            <track label="English" kind="subtitles" srcLang="en" default />
          </video>
        </div>
      )}
    </div>
  );
}

export default VIdeoPlay;
