import { folderApi } from '@/services/folder';
import { store } from '@/store/store';
import { LoaderFunctionArgs, Params } from 'react-router-dom';

export type LoaderResult = { label: string; params: Params<string> };

export const folderLoader = async ({ params }: LoaderFunctionArgs) => {
  let label = '';
  const promise = store.dispatch(
    folderApi.endpoints.getFolderById.initiate(params?.folderId || ''),
  );

  try {
    const response = await promise.unwrap();
    promise.unsubscribe();

    label = response?.data?.name || '';
  } catch (e) {
    console.log(e);
  }

  return { label, params } as LoaderResult;
};
