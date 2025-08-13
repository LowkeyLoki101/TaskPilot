import { google, youtube_v3 } from 'googleapis';

const getYouTubeClient = () => {
  if (!process.env.YOUTUBE_API_KEY) {
    throw new Error('YouTube API key not configured');
  }
  return google.youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY
  });
};

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  publishedAt: string;
  channelTitle: string;
}

export interface YouTubePlaylist {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  itemCount: number;
  videos: YouTubeVideo[];
}

export class YouTubeService {
  async searchVideos(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    const youtube = getYouTubeClient();

    try {
      const searchResponse = await youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults,
        order: 'relevance'
      });

      if (!searchResponse.data.items) {
        return [];
      }

      const videoIds = searchResponse.data.items
        .map((item: any) => item.id?.videoId)
        .filter(Boolean) as string[];
      
      // Get additional video details
      const videoDetails = await youtube.videos.list({
        part: ['contentDetails', 'statistics'],
        id: videoIds
      });

      return searchResponse.data.items.map((item: any, index: number) => {
        const details = videoDetails.data.items?.[index];
        return {
          id: item.id?.videoId || '',
          title: item.snippet?.title || '',
          description: item.snippet?.description || '',
          thumbnail: item.snippet?.thumbnails?.medium?.url || '',
          duration: details?.contentDetails?.duration || '',
          viewCount: details?.statistics?.viewCount || '0',
          publishedAt: item.snippet?.publishedAt || '',
          channelTitle: item.snippet?.channelTitle || ''
        };
      });
    } catch (error) {
      console.error('YouTube API error:', error);
      throw new Error('Failed to search YouTube videos');
    }
  }

  async getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
    const youtube = getYouTubeClient();

    try {
      const response = await youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: [videoId]
      });

      const video = response.data.items?.[0];
      if (!video) return null;

      return {
        id: video.id || '',
        title: video.snippet?.title || '',
        description: video.snippet?.description || '',
        thumbnail: video.snippet?.thumbnails?.medium?.url || '',
        duration: video.contentDetails?.duration || '',
        viewCount: video.statistics?.viewCount || '0',
        publishedAt: video.snippet?.publishedAt || '',
        channelTitle: video.snippet?.channelTitle || ''
      };
    } catch (error) {
      console.error('YouTube API error:', error);
      return null;
    }
  }

  async getChannelVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    const youtube = getYouTubeClient();

    try {
      const searchResponse = await youtube.search.list({
        part: ['snippet'],
        channelId,
        type: ['video'],
        maxResults,
        order: 'date'
      });

      if (!searchResponse.data.items) {
        return [];
      }

      return searchResponse.data.items.map((item: any) => ({
        id: item.id?.videoId || '',
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        thumbnail: item.snippet?.thumbnails?.medium?.url || '',
        duration: '',
        viewCount: '0',
        publishedAt: item.snippet?.publishedAt || '',
        channelTitle: item.snippet?.channelTitle || ''
      }));
    } catch (error) {
      console.error('YouTube API error:', error);
      throw new Error('Failed to get channel videos');
    }
  }
}