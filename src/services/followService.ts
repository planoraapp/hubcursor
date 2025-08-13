
import { supabase } from '@/integrations/supabase/client';

export interface FollowData {
  id: string;
  follower_user_id: string;
  followed_user_id: string;
  follower_habbo_name: string;
  followed_habbo_name: string;
  created_at: string;
}

export const followService = {
  // Follow a user
  async followUser(followerUserId: string, followedUserId: string, followerHabboName: string, followedHabboName: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_follows')
        .insert({
          follower_user_id: followerUserId,
          followed_user_id: followedUserId,
          follower_habbo_name: followerHabboName,
          followed_habbo_name: followedHabboName
        });

      if (error) {
        console.error('Error following user:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in followUser:', error);
      return false;
    }
  },

  // Unfollow a user
  async unfollowUser(followerUserId: string, followedUserId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_follows')
        .delete()
        .eq('follower_user_id', followerUserId)
        .eq('followed_user_id', followedUserId);

      if (error) {
        console.error('Error unfollowing user:', error);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error in unfollowUser:', error);
      return false;
    }
  },

  // Check if user is following another user
  async isFollowing(followerUserId: string, followedUserId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('id')
        .eq('follower_user_id', followerUserId)
        .eq('followed_user_id', followedUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking follow status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in isFollowing:', error);
      return false;
    }
  },

  // Get followers count for a user
  async getFollowersCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact' })
        .eq('followed_user_id', userId);

      if (error) {
        console.error('Error getting followers count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getFollowersCount:', error);
      return 0;
    }
  },

  // Get following count for a user
  async getFollowingCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact' })
        .eq('follower_user_id', userId);

      if (error) {
        console.error('Error getting following count:', error);
        return 0;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getFollowingCount:', error);
      return 0;
    }
  },

  // Get followers list
  async getFollowers(userId: string): Promise<FollowData[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('followed_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting followers:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFollowers:', error);
      return [];
    }
  },

  // Get following list
  async getFollowing(userId: string): Promise<FollowData[]> {
    try {
      const { data, error } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting following:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getFollowing:', error);
      return [];
    }
  }
};
