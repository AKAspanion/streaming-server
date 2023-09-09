import { folderApi } from '@/services/folder';
import { store } from '@/store/store';
import { normalizeText } from '@common/utils/validate';
import { LoaderFunctionArgs, Params } from 'react-router-dom';

export type LoaderResult = { label: string; params: Params<string> };

export const folderLoader = async ({ params }: LoaderFunctionArgs) => {
  let label = '';
  const promise = store.dispatch(
    folderApi.endpoints.getFolderById.initiate(normalizeText(params?.folderId)),
  );

  try {
    const response = await promise.unwrap();
    promise.unsubscribe();

    label = normalizeText(response?.data?.name);
  } catch (e) {
    // e
  }

  return { label, params } as LoaderResult;
};
