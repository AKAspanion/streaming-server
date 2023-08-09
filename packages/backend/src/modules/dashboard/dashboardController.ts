import { msToHour } from '@common/utils/date-time';
import { getAllMediaData } from '@modules/media/mediaData';
import { HttpCode } from '@utils/exceptions';
import { RequestHandler } from 'express';

export const getRecentAdded: RequestHandler = async (req, res) => {
  const { data: mediaList } = await getAllMediaData();

  const currDate = new Date().getTime();
  const recent = mediaList
    .filter((m) => !isNaN(m?.addDate) && msToHour(currDate - m?.addDate) < 48)
    .sort((a, b) => (a.addDate > b.addDate ? -1 : 1));

  return res.status(HttpCode.OK).send({ data: recent.slice(0, 4) });
};

export const getRecentWatched: RequestHandler = async (req, res) => {
  const { data: mediaList } = await getAllMediaData();

  const currDate = new Date().getTime();
  const recent = mediaList.filter(
    (m) =>
      m?.currentTime &&
      m?.lastPlayedDate &&
      !isNaN(m?.lastPlayedDate) &&
      msToHour(currDate - m?.lastPlayedDate) < 48,
  );

  return res.status(HttpCode.OK).send({ data: recent });
};

export const getFavourites: RequestHandler = async (req, res) => {
  const { data: mediaList } = await getAllMediaData();

  const favourites = mediaList.filter((m) => !!m?.isFavourite);

  return res.status(HttpCode.OK).send({ data: favourites });
};
