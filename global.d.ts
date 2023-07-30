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
  crumb: CrumbFunction[];
};

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

declare type SubsType = {
  id: string;
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
  videoId: string;
};

declare type VideoTypeJSONDB = VideoType & {
  sub?: SubsType;
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

declare type MediaChapterType = any;
declare type MediaStreamType = any;
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
  format: MediaFormatType;
  chapters: MediaChapterType[];
  addDate: number;
  lastPlayedDate?: number;
  isFavourite?: boolean;
  watched?: boolean;
  paused: ?boolean;
  currentTime: ?number;
  thumbnail: {
    path: string;
    name: string;
  };
};

declare type MediaTypeFull = MediaTypeJSONDB & {
  src: string;
};

declare type MediaType = {
  id: string;
  format: any;
  originalName: string;
  mimeType: string;
  path: string;
};
