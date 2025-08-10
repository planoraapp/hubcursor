
import { useQueries } from '@tanstack/react-query';
import { habboProxyService } from '@/services/habboProxyService';

export const useUserFigures = (usernames: string[]) => {
  const queries = useQueries({
    queries: usernames.map(username => ({
      queryKey: ['user-figure', username],
      queryFn: () => habboProxyService.getUserProfile(username),
      staleTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      enabled: !!username,
    }))
  });

  // Create a map of username -> figureString
  const figureMap = usernames.reduce((acc, username, index) => {
    const query = queries[index];
    if (query.data?.figureString) {
      acc[username] = query.data.figureString;
    }
    return acc;
  }, {} as Record<string, string>);

  const isLoading = queries.some(query => query.isLoading);

  return {
    figureMap,
    isLoading
  };
};
