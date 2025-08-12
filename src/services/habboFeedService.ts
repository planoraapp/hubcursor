
class HabboFeedService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  }

  async getUserFeed(hotel: string, username: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/habbo-feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          hotel,
          username
        }),
      });

      if (!response.ok) {
        console.warn(`Failed to fetch user feed for ${username}:`, response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching user feed for ${username}:`, error);
      return null;
    }
  }

  async triggerUserSync(username: string, hotel: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/habbo-sync-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          habbo_name: username,
          hotel
        }),
      });

      if (!response.ok) {
        console.warn(`Failed to trigger sync for ${username}:`, response.status);
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error triggering sync for ${username}:`, error);
      return null;
    }
  }

  formatTimeAgo(timestamp: string): string {
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return 'há alguns segundos';
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `há ${minutes} minuto${minutes > 1 ? 's' : ''}`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `há ${hours} hora${hours > 1 ? 's' : ''}`;
      } else {
        const days = Math.floor(diffInSeconds / 86400);
        return `há ${days} dia${days > 1 ? 's' : ''}`;
      }
    } catch (error) {
      return 'há alguns segundos';
    }
  }
}

export const habboFeedService = new HabboFeedService();
