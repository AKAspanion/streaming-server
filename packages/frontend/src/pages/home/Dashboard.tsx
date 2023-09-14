import {
  useGetFavouritesQuery,
  useGetRecentAddedQuery,
  useGetRecentCompletedQuery,
  useGetRecentWatchedQuery,
} from '@/services/dashboard';
import { FC } from 'react';
import MediaCard from '@/components/MediaCard';
import SectionHeader from '@/components/SectionHeader';
import Scroller from '@/components/Scroller';

interface DashboardProps {}

const Dashboard: FC<DashboardProps> = () => {
  const { data: recentCompleted } = useGetRecentCompletedQuery();
  const { data: recentWatched } = useGetRecentWatchedQuery();
  const { data: recentAdded } = useGetRecentAddedQuery();
  const { data: favourites } = useGetFavouritesQuery();

  const recentCompletedList = recentCompleted?.data || [];
  const recentWatchedList = recentWatched?.data || [];
  const recentAddedList = recentAdded?.data || [];
  const favouritesList = favourites?.data || [];

  return (
    <div>
      {recentWatchedList?.length ? (
        <div className="pt-4">
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
        <div className="pt-4">
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
        <div className="pt-4">
          <SectionHeader className="pb-4 px-4" title="Added Recently" />
          <Scroller width="100%">
            {recentAddedList.map((m) => (
              <div key={m.id} className="min-w-[300px]">
                <MediaCard media={m} backTo="/" />
              </div>
            ))}
          </Scroller>
        </div>
      ) : null}
      {recentCompletedList?.length ? (
        <div className="pt-4">
          <SectionHeader className="pb-4 px-4" title="Completed Recently" />
          <Scroller width="100%">
            {recentCompletedList.map((m) => (
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
