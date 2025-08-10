
export interface ConsoleComment {
  id: string;
  username: string;
  message: string;
  timestamp: string;
  targetUser: string;
  author_habbo_name: string;
  comment_text: string;
  created_at: string;
}

export interface ConsoleFollow {
  id: string;
  follower: string;
  following: string;
  timestamp: string;
}

export const consoleInteractionsService = {
  getLikes: async (username: string): Promise<any[]> => {
    // Mock implementation
    return [];
  },

  getComments: async (username: string): Promise<ConsoleComment[]> => {
    // Mock implementation
    return [];
  },

  getFollows: async (username: string): Promise<ConsoleFollow[]> => {
    // Mock implementation
    return [];
  },

  getFollowing: async (username: string): Promise<ConsoleFollow[]> => {
    // Mock implementation
    return [];
  },

  hasUserLiked: async (username: string): Promise<boolean> => {
    return false;
  },

  isUserFollowing: async (username: string): Promise<boolean> => {
    return false;
  },

  addLike: async (username: string, targetUniqueId?: string): Promise<boolean> => {
    // Mock implementation
    return true;
  },

  removeLike: async (username: string): Promise<boolean> => {
    // Mock implementation
    return true;
  },

  addComment: async (username: string, message: string, authorName: string, targetUniqueId?: string): Promise<boolean> => {
    // Mock implementation
    return true;
  },

  deleteComment: async (commentId: string): Promise<boolean> => {
    // Mock implementation
    return true;
  },

  followUser: async (username: string, followerName: string, targetUniqueId?: string): Promise<boolean> => {
    // Mock implementation
    return true;
  },

  unfollowUser: async (username: string): Promise<boolean> => {
    // Mock implementation
    return true;
  }
};
