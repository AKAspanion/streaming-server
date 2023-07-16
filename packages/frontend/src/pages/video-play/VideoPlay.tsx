import { useGetVideoByIdQuery } from "../../services/video";
import { baseUrl } from "../../config/api";
import { useParams } from "react-router-dom";
import { useLayoutEffect, useRef } from "react";

import "./VideoPlay.css";
import LazyHeader from "../../componets/LazyHeader";
import { buttonVariant } from "../../componets/button";
import toWebVTT from "srt-webvtt";

function VIdeoPlay() {
  const ref = useRef<HTMLVideoElement>(null);
  const { videoId } = useParams();

  if (!videoId) {
    return <div>Video ID is required to play content</div>;
  }

  const { data, error, isLoading } = useGetVideoByIdQuery(videoId);

  const srcUrl = `${baseUrl}/video/stream/${videoId}`;

  const handleSubtitleLoad = async (e: any) => {
    try {
      if (ref.current && e.target.files) {
        const textTrackUrl = await toWebVTT(e.target.files[0]); // this function accepts a parameer of SRT subtitle blob/file object
        // It is a valid url that can be used as text track URL
        const track = ref.current.children[1] as HTMLTrackElement; // Track element (which is child of a video element)
        const video = ref.current as HTMLVideoElement; // Main video element
        console.log(track, video, textTrackUrl);
        if (track && video) {
          track.src = textTrackUrl; // Set the converted URL to track's source
          video.textTracks[0].mode = "showing"; // Start showing subtitle to your track

          const btn = document.getElementById("myBtn");
          if (btn) {
            btn.style.display = "none";
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const addSubtitle = () => {
    const subInputDom = document.getElementById("subInput");
    if (subInputDom) {
      subInputDom.click();
    }
  };

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
        <div id="">
          <video autoPlay controls ref={ref} id="myVideo">
            <source src={srcUrl} type="video/mp4" />
            <track label="English" kind="subtitles" srcLang="en" default />
          </video>
          <input
            type="file"
            id="subInput"
            className="invisible"
            onChange={handleSubtitleLoad}
          />
          <button id="myBtn" onClick={addSubtitle} {...buttonVariant()}>
            {"Add Subs"}
          </button>

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
