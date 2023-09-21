import {
  useGetFavoritesQuery,
  useGetRecentAddedQuery,
  useGetRecentCompletedQuery,
  useGetRecentWatchedQuery,
} from '@/services/dashboard';
import { FC } from 'react';
import MediaCard from '@/components/MediaCard';
import SectionHeader from '@/components/SectionHeader';
import Scroller from '@/components/Scroller';
import NoData from '@/components/NoData';
import { Squares2X2Icon } from '@heroicons/react/24/solid';
import Spinner from '@/components/atoms/spinner/Spinner';

interface DashboardProps {}

const Dashboard: FC<DashboardProps> = () => {
  const { data: recentCompleted, isLoading: recentCompletedLoading } = useGetRecentCompletedQuery();
  const { data: recentWatched, isLoading: recentWatchedLoading } = useGetRecentWatchedQuery();
  const { data: recentAdded, isLoading: recentAddedLoading } = useGetRecentAddedQuery();
  const { data: favorites, isLoading: favoritesLoading } = useGetFavoritesQuery();

  const recentCompletedList = recentCompleted?.data || [];
  const recentWatchedList = recentWatched?.data || [];
  const recentAddedList = recentAdded?.data || [];
  const favoritesList = favorites?.data || [];

  const isEmpty =
    !recentCompletedList?.length &&
    !recentWatchedList?.length &&
    !recentAddedList?.length &&
    !favoritesList?.length;

  const loading =
    recentCompletedLoading || recentWatchedLoading || recentAddedLoading || favoritesLoading;

  return loading ? (
    <Spinner full />
  ) : (
    <div>
      {isEmpty && (
        <div
          style={
            {
              '--dashboard-content-h': 'calc(10vh - var(--video-header-height) - 48px)',
              '--dashboard-content-h-md': 'calc(100vh - var(--video-header-height-md) - 48px)',
            } as React.CSSProperties
          }
          className="h-[var(--dashboard-content-h)] md:h-[var(--dashboard-content-h-md)] overflow-y-auto"
        >
          <NoData
            className="py-8 px-4"
            title="No data found"
            description="Navigate to media or video section to get started!"
            icon={<Squares2X2Icon />}
          />
        </div>
      )}
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
      {favoritesList?.length ? (
        <div className="pt-4">
          <SectionHeader className="pb-4 px-4" title="Favorites" />
          <Scroller width="100%">
            {favoritesList.map((m) => (
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
