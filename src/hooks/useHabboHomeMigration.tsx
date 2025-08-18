
import { useHabboHome } from './useHabboHome';

export const useHabboHomeMigration = (username: string) => {
  return useHabboHome(username);
};
