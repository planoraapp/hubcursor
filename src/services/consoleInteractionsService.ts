
// Mock Console Interactions Service
export const consoleInteractionsService = {
  getLikes: async (username: string): Promise<any[]> => {
    return [];
  },

  getComments: async (username: string): Promise<any[]> => {
    return [];
  },

  getFollows: async (username: string): Promise<any[]> => {
    return [];
  },

  hasUserLiked: async (username: string): Promise<boolean> => {
    return false;
  },

  isUserFollowing: async (username: string): Promise<boolean> => {
    return false;
  },

  addLike: async (username: string, uniqueId?: string): Promise<boolean> => {
    return true;
  },

  removeLike: async (username: string): Promise<boolean> => {
    return true;
  },

  addComment: async (username: string, comment: string, commenterName: string, uniqueId?: string): Promise<boolean> => {
    return true;
  },

  deleteComment: async (commentId: string): Promise<boolean> => {
    return true;
  },

  followUser: async (username: string, followerName: string, uniqueId?: string): Promise<boolean> => {
    return true;
  },

  unfollowUser: async (username: string): Promise<boolean> => {
    return true;
  },
};
