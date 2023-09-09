/* eslint-disable @typescript-eslint/no-explicit-any */

declare type RouterMatcher = {
  id: string;
  pathname: string;
  params: any;
  data: unknown;
  handle: RouterHandler;
};

declare type CrumbType = {
  to: string;
  label: string;
};

declare type CrumbFunction = (data: any) => CrumbType;

declare type RouterHandler = {
  hide?: boolean;
  full?: boolean;
  crumb: CrumbFunction[];
};

declare type APIStatusResponseType = {
  data: { message: string };
};
declare type APIErrorType = APIStatusResponseType;

declare type VideoType = {
  id: string;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
};

declare type SubtitleType = {
  id: string;
  name: string;
  fieldname?: string;
  originalname?: string;
  encoding?: string;
  mimetype?: string;
  destination?: string;
  filename?: string;
  path: string;
  size?: number;
  copied?: boolean;
};

declare type FolderTypeJSONDB = FolderBaseType;

declare type FolderBaseType = {
  id: string;
  name: string;
  category?: string;
  description?: string;
};

declare type FolderJoinType = {
  totalFiles?: number;
};

declare type FolderType = FolderJoinType & FolderBaseType;

declare type AddFolderRequest = Omit<FolderType, 'id'>;
declare type UpdateFolderRequest = FolderType;

declare type VideoTypeJSONDB = VideoType & {
  sub?: SubtitleType;
  thumbnail?: ThumbnailType;
};

declare type PathLocationType = 'directory' | 'file';

declare type FileLocationType = {
  path: string;
  name: string;
  type: PathLocationType;
  ext?: string;
  stat?: Stats;
  isFile?: boolean;
};

declare type AddMediaAPIRequest = { file: FileLocationType; folderId?: string };

declare type MediaChapterType = any;
declare type MediaStreamType = any;
declare type ThumbnailType = {
  path: string;
  name: string;
};

declare type PosterType = {
  path: string;
  name?: string;
};
declare type MediaFormatType = {
  filename?: string;
  nb_streams: number;
  nb_programs: number;
  format_name?: string;
  format_long_name?: string;
  start_time: number;
  duration: number;
  size: number;
  bit_rate: number;
  probe_score: number;
  tags: Record<string, string>;
};

declare type MediaTypeJSONDB = MediaType & {
  streams: MediaStreamType[];
  audioStreams: MediaStreamType[];
  subtitleStreams: MediaStreamType[];
  format: MediaFormatType;
  chapters: MediaChapterType[];
};

declare type MediaTypeFull = MediaTypeJSONDB & {
  src: string;
};

declare type MediaType = {
  id: string;
  folderId?: string;
  format: any;
  originalName: string;
  mimeType: string;
  path: string;
  addDate: number;
  lastPlayedDate?: number;
  isFavourite?: boolean;
  watched?: boolean;
  paused?: boolean;
  currentTime?: number;
  selectedAudio: string;
  selectedSubtitle: number;
  sub?: SubtitleType;
  thumbnail?: ThumbnailType;
  poster?: PosterType;
  subs?: SubtitleType[];
};
