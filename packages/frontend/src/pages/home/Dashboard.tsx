import {
  useGetFavouritesQuery,
  useGetRecentAddedQuery,
  useGetRecentWatchedQuery,
} from '@/services/dashboard';
import { FC } from 'react';
import MediaCard from '@/components/MediaCard';
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
        <div className="py-4">
          <SectionHeader className="pb-4 px-4" title="Favourites" />
          <Scroller width="100%">
            {favouritesList.map((m) => (
              <div key={m.id} className="min-w-[300px]">
                <MediaCard media={m} backTo="/" />
              </div>
            ))}
          </Scroller>
        </div>
      ) : null}
      {recentAddedList?.length ? (
        <div className="py-4">
          <SectionHeader className="pb-4 px-4" title="Recently Added" />
          <Scroller width="100%">
            {recentAddedList.map((m) => (
              <div key={m.id} className="min-w-[300px]">
                <MediaCard media={m} backTo="/" />
              </div>
            ))}
          </Scroller>
        </div>
      ) : null}
    </div>
  );
};

export default Dashboard;
