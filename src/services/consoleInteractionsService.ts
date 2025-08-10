import { supabase } from '@/integrations/supabase/client';

export interface ConsoleLike {
  id: string;
  user_id: string;
  target_habbo_name: string;
  target_habbo_id?: string;
  created_at: string;
}

export interface ConsoleComment {
  id: string;
  user_id: string;
  author_habbo_name: string;
  target_habbo_name: string;
  target_habbo_id?: string;
  comment_text: string;
  created_at: string;
}

export interface ConsoleFollow {
  id: string;
  follower_user_id: string;
  follower_habbo_name: string;
  target_habbo_name: string;
  target_habbo_id?: string;
  created_at: string;
}

class ConsoleInteractionsService {
  // Likes
  async getLikes(targetHabboName: string): Promise<ConsoleLike[]> {
    try {
      const { data, error } = await supabase
        .from('console_profile_likes')
        .select('*')
        .eq('target_habbo_name', targetHabboName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching likes:', error);
      return [];
    }
  }

  async addLike(targetHabboName: string, targetHabboId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('console_profile_likes')
        .insert({
          user_id: user.id,
          target_habbo_name: targetHabboName,
          target_habbo_id: targetHabboId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding like:', error);
      return false;
    }
  }

  async removeLike(targetHabboName: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('console_profile_likes')
        .delete()
        .eq('user_id', user.id)
        .eq('target_habbo_name', targetHabboName);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing like:', error);
      return false;
    }
  }

  async hasUserLiked(targetHabboName: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('console_profile_likes')
        .select('id')
        .eq('user_id', user.id)
        .eq('target_habbo_name', targetHabboName)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if user liked:', error);
      return false;
    }
  }

  // Comments
  async getComments(targetHabboName: string): Promise<ConsoleComment[]> {
    try {
      const { data, error } = await supabase
        .from('console_profile_comments')
        .select('*')
        .eq('target_habbo_name', targetHabboName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  }

  async addComment(targetHabboName: string, commentText: string, authorHabboName: string, targetHabboId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('console_profile_comments')
        .insert({
          user_id: user.id,
          author_habbo_name: authorHabboName,
          target_habbo_name: targetHabboName,
          target_habbo_id: targetHabboId,
          comment_text: commentText
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding comment:', error);
      return false;
    }
  }

  async deleteComment(commentId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('console_profile_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting comment:', error);
      return false;
    }
  }

  // Follows
  async getFollows(targetHabboName: string): Promise<ConsoleFollow[]> {
    try {
      const { data, error } = await supabase
        .from('console_profile_follows')
        .select('*')
        .eq('target_habbo_name', targetHabboName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching follows:', error);
      return [];
    }
  }

  async getFollowing(habboName: string): Promise<ConsoleFollow[]> {
    try {
      const { data, error } = await supabase
        .from('console_profile_follows')
        .select('*')
        .eq('follower_habbo_name', habboName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  }

  async followUser(targetHabboName: string, followerHabboName: string, targetHabboId?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('console_profile_follows')
        .insert({
          follower_user_id: user.id,
          follower_habbo_name: followerHabboName,
          target_habbo_name: targetHabboName,
          target_habbo_id: targetHabboId
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  }

  async unfollowUser(targetHabboName: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('console_profile_follows')
        .delete()
        .eq('follower_user_id', user.id)
        .eq('target_habbo_name', targetHabboName);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error unfollowing user:', error);
      return false;
    }
  }

  async isUserFollowing(targetHabboName: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('console_profile_follows')
        .select('id')
        .eq('follower_user_id', user.id)
        .eq('target_habbo_name', targetHabboName)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if user is following:', error);
      return false;
    }
  }
}

export const consoleInteractionsService = new ConsoleInteractionsService();
