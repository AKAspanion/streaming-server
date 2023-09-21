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

  return res.status(HttpCode.OK).send({ data: recent.slice(0, 10) });
};

export const getRecentWatched: RequestHandler = async (req, res) => {
  const { data: mediaList } = await getAllMediaData();

  const currDate = new Date().getTime();
  const recent = mediaList
    .filter(
      (m) =>
        !m?.watched &&
        m?.currentTime &&
        m?.lastPlayedDate &&
        !isNaN(m?.lastPlayedDate) &&
        msToHour(currDate - m?.lastPlayedDate) < 48,
    )
    .sort((a, b) =>
      a.lastPlayedDate && b.lastPlayedDate ? (a.lastPlayedDate > b.lastPlayedDate ? -1 : 1) : -1,
    );

  return res.status(HttpCode.OK).send({ data: recent.slice(0, 10) });
};

export const getRecentCompleted: RequestHandler = async (req, res) => {
  const { data: mediaList } = await getAllMediaData();

  const currDate = new Date().getTime();
  const recent = mediaList
    .filter(
      (m) =>
        m?.watched &&
        m?.lastPlayedDate &&
        !isNaN(m?.lastPlayedDate) &&
        msToHour(currDate - m?.lastPlayedDate) < 48,
    )
    .sort((a, b) =>
      a.lastPlayedDate && b.lastPlayedDate ? (a.lastPlayedDate > b.lastPlayedDate ? -1 : 1) : -1,
    );

  return res.status(HttpCode.OK).send({ data: recent.slice(0, 10) });
};

export const getFavorites: RequestHandler = async (req, res) => {
  const { data: mediaList } = await getAllMediaData();

  const favorites = mediaList.filter((m) => !!m?.isFavorite);

  return res.status(HttpCode.OK).send({ data: favorites.slice(0, 10) });
};
