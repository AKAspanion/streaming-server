import { pushMediaDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';

export const addOneMediaSubtitle = async (mediaId: string, body: SubtitleType) => {
  const { error: pushError } = await pushMediaDB(`/${mediaId}/sub`, body);

  if (pushError) {
    handleJSONDBDataError(pushError, mediaId);
  }

  return { data: body };
};

export const addOneVideoSubtitle = async (mediaId: string, body: SubtitleType) => {
  const { error: pushError } = await pushMediaDB(`/${mediaId}/sub`, body);

  if (pushError) {
    handleJSONDBDataError(pushError, mediaId);
  }

  return { data: body };
};
