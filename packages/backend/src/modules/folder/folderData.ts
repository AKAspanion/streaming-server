import { getFolderDataDB, pushFolderDB } from '@database/json';
import { handleJSONDBDataError } from '@utils/error';
import { AppError, HttpCode } from '@utils/exceptions';

export const addOneFolder = async (id: string, body: FolderType) => {
  const { error: pushError } = await pushFolderDB(`/${id}`, body);

  if (pushError) {
    handleJSONDBDataError(pushError, id);
  }

  return true;
};

export const getAllFolderData = async () => {
  const { data: result, error } = await getFolderDataDB<Record<string, FolderTypeJSONDB>>(`/`);
  if (error) {
    handleJSONDBDataError(error);
  }

  if (!result) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Folder not found' });
  }

  const data: FolderType[] = (
    result
      ? Object.keys(result || {}).map((id) => ({
          ...(result[id] || {}),
          id,
        }))
      : []
  ).sort((a, b) => (a.name > b.name ? 1 : b.name > a.name ? -1 : 0));

  return { data };
};

export const getOneFolderData = async (folderId: string) => {
  const { data, error } = await getFolderDataDB<FolderTypeJSONDB>(`/${folderId}`);

  if (error) {
    handleJSONDBDataError(error, folderId);
  }

  if (!data) {
    throw new AppError({ httpCode: HttpCode.BAD_REQUEST, description: 'Folder not found' });
  }

  return { data: { ...data, id: folderId } };
};
