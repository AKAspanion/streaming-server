import { FC } from "react";
import { buttonVariant } from "../../componets/button";
import { Link } from "react-router-dom";

interface VideoListItemProps {
  video: VideoType;
  loading: boolean;
  onDelete: (v: VideoType) => void;
  onSubtitle: (v: VideoType, srt?: File) => void;
}

const VideoListItem: FC<VideoListItemProps> = ({
  video,
  loading,
  onDelete,
  onSubtitle,
}) => {
  const handleSubtitleLoad = async (e: any) => {
    try {
      if (e.target.files) {
        onSubtitle(video, e.target.files[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openFile = () => {
    const subInputDom = document.getElementById("subInput");
    if (subInputDom) {
      subInputDom.click();
    }
  };

  return loading ? (
    <div>Loading... Please wait</div>
  ) : (
    <div
      key={video.id}
      className="bg-slate-800 p-2 px-4 rounded-md flex items-center gap-4 justify-between mb-4"
    >
      <div>{video.originalname}</div>
      <div className="text-lg flex">
        <div {...buttonVariant()} onClick={() => onDelete(video)}>
          🗑️
        </div>
        <div {...buttonVariant()} onClick={() => openFile()}>
          <p className="font-bold">CC</p>
        </div>
        <Link {...buttonVariant()} to={`/video-play/${video.id}`}>
          ▶️
        </Link>

        <input
          type="file"
          id="subInput"
          accept=".srt"
          className="invisible fixed pointer-events-none left-0"
          onChange={handleSubtitleLoad}
        />
      </div>
    </div>
  );
};

export default VideoListItem;
