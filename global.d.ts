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

declare type MediaTypeJSONDB = MediaType & {
  streams: any;
  format: any;
  chapters: any;
  thumbnail: {
    path: string;
    name: string;
  };
};

declare type MediaType = {
  id: string;
  format: any;
  parsedData: any;
  originalName: string;
  mimeType: string;
};
