import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { getLeaderboard } from '../api/leaderboardService';

export default function useLeaderboard({ scope, page, limit = 10 }) {
  return useQuery({
    queryKey: ['leaderboard', scope, page, limit],
    queryFn: () => getLeaderboard({ scope, page, limit }),
    refetchInterval: 30000,
    placeholderData: keepPreviousData,
  });
}