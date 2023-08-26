import {
  useGetFavouritesQuery,
  useGetRecentAddedQuery,
  useGetRecentWatchedQuery,
} from '@/services/dashboard';
import { FC } from 'react';
import MediaCard from '../manage-media/MediaCard';
import SectionHeader from '@/components/SectionHeader';
import Scroller from '@/components/Scroller';

interface DashboardProps {}

const Dashboard: FC<DashboardProps> = () => {
  const { data: recentWatched } = useGetRecentWatchedQuery();
  const { data: recentAdded } = useGetRecentAddedQuery();
  const { data: favourites } = useGetFavouritesQuery();

  const recentWatchedList = recentWatched?.data || [];
  const recentAddedList = recentAdded?.data || [];
  const favouritesList = favourites?.data || [];

  return (
    <div>
      {recentWatchedList?.length ? (
        <div className="py-4">
          <SectionHeader className="pb-4 px-4" title="Continue Watching" />
          <Scroller width="100%">
            {recentWatchedList.map((m) => (
              <div key={m.id} className="min-w-[300px]">
                <MediaCard media={m} backTo="/" />
              </div>
            ))}
          </Scroller>
        </div>
      ) : null}
      {favouritesList?.length ? (
        <div className="p-4">
          <SectionHeader className="pb-4" title="Favourites" />
          <div className="flex gap-4">
            {favouritesList.map((m) => (
              <div key={m.id} className="min-w-[300px]">
                <MediaCard media={m} backTo="/" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {recentAddedList?.length ? (
        <div className="p-4">
          <SectionHeader className="pb-4" title="Recently Added" />
          <div className="flex gap-4">
            {recentAddedList.map((m) => (
              <div key={m.id} className="min-w-[300px]">
                <MediaCard media={m} backTo="/" />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
