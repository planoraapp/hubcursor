
import { supabase } from '@/integrations/supabase/client';

export interface FollowData {
  id: string;
  follower_user_id: string;
  followed_habbo_id: string;
  follower_habbo_name: string;
  followed_habbo_name: string;
  created_at: string;
}

export const followService = {
  // Follow a user
  async followUser(followerUserId: string, followedHabboId: string, followerHabboName: string, followedHabboName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_followers')
        .insert({
          follower_user_id: followerUserId,
          followed_habbo_id: followedHabboId,
          follower_habbo_name: followerHabboName,
          followed_habbo_name: followedHabboName
        });

      if (error) {
                return false;
      }
      return true;
    } catch (error) {
            return false;
    }
  },

  // Unfollow a user
  async unfollowUser(followerUserId: string, followedHabboId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_followers')
        .delete()
        .eq('follower_user_id', followerUserId)
        .eq('followed_habbo_id', followedHabboId);

      if (error) {
                return false;
      }
      return true;
    } catch (error) {
            return false;
    }
  },

  // Check if user is following another user
  async isFollowing(followerUserId: string, followedHabboId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select('id')
        .eq('follower_user_id', followerUserId)
        .eq('followed_habbo_id', followedHabboId)
        .single();

      if (error && error.code !== 'PGRST116') {
                return false;
      }

      return !!data;
    } catch (error) {
            return false;
    }
  },

  // Get followers count for a user (by their habbo_id)
  async getFollowersCount(habboId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_followers')
        .select('*', { count: 'exact' })
        .eq('followed_habbo_id', habboId);

      if (error) {
                return 0;
      }

      return count || 0;
    } catch (error) {
            return 0;
    }
  },

  // Get following count for a user (by their user_id)
  async getFollowingCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_followers')
        .select('*', { count: 'exact' })
        .eq('follower_user_id', userId);

      if (error) {
                return 0;
      }

      return count || 0;
    } catch (error) {
            return 0;
    }
  },

  // Get followers list
  async getFollowers(habboId: string): Promise<FollowData[]> {
    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select('*')
        .eq('followed_habbo_id', habboId)
        .order('created_at', { ascending: false });

      if (error) {
                return [];
      }

      return data || [];
    } catch (error) {
            return [];
    }
  },

  // Get following list
  async getFollowing(userId: string): Promise<FollowData[]> {
    try {
      const { data, error } = await supabase
        .from('user_followers')
        .select('*')
        .eq('follower_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
                return [];
      }

      return data || [];
    } catch (error) {
            return [];
    }
  }
};
