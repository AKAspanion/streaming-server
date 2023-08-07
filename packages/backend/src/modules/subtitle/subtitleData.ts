import { geMediaDBIndex, getMediaDataDB, pushMediaDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';

export const addOneMediaSubtitle = async (mediaId: string, body: SubtitleType) => {
  const { error: pushError } = await pushMediaDB(`/${mediaId}/subs[]`, body);

  if (pushError) {
    handleJSONDBDataError(pushError, mediaId);
  }

  return { data: body };
};

export const getOneMediaSubtitle = async (mediaId: string) => {
  const index = await geMediaDBIndex('/${mediaId}/subs', mediaId);
  const { data, error: getError } = await getMediaDataDB(`/${mediaId}/subs[${index}]`);

  if (getError) {
    handleJSONDBDataError(getError, mediaId);
  }

  return { data };
};

export const addOneVideoSubtitle = async (mediaId: string, body: SubtitleType) => {
  const { error: pushError } = await pushMediaDB(`/${mediaId}/subs[]`, body);

  if (pushError) {
    handleJSONDBDataError(pushError, mediaId);
  }

  return { data: body };
};
