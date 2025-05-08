import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig, SpotifyConfig } from 'config/configuration';
import { SpotifyRepository } from './repository/spotify.repository';
import axios from 'axios';

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private readonly spotifyConfig: SpotifyConfig;

  constructor(
    private readonly configService: ConfigService<AppConfig>,
    private readonly spotifyRepository: SpotifyRepository,
  ) {
    this.spotifyConfig = this.configService.get<SpotifyConfig>('spotify')!;
  }

  getAuthorizationUrl(userId: string, state: string): string {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'streaming',
      'user-library-read',
      'playlist-read-private',
      'user-top-read'
    ];

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.spotifyConfig.clientId,
      scope: scopes.join(' '),
      redirect_uri: this.spotifyConfig.redirectUri,
      state: state,
      show_dialog: 'true'
    });

    const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
    this.logger.log(`Generated Spotify Auth URL: ${authUrl}`);
    return authUrl;
  }

  async exchangeCodeForTokens(code: string, userId: string): Promise<boolean> {
    try {
      const tokenResponse = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.spotifyConfig.redirectUri,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${this.spotifyConfig.clientId}:${this.spotifyConfig.clientSecret}`,
          ).toString('base64')}`,
        },
      });

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      // Check if user already has credentials
      const existingCredentials = await this.spotifyRepository.getCredentialsByUserId(userId);
      
      if (existingCredentials) {
        await this.spotifyRepository.updateCredentials(userId, {
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt,
        });
      } else {
        await this.spotifyRepository.createCredentials({
          userId,
          accessToken: access_token,
          refreshToken: refresh_token,
          expiresAt,
        });
      }

      return true;
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens', error);
      return false;
    }
  }

  async refreshAccessToken(userId: string): Promise<string | null> {
    const credentials = await this.spotifyRepository.getCredentialsByUserId(userId);
    
    if (!credentials) {
      return null;
    }

    try {
      const response = await axios({
        method: 'post',
        url: 'https://accounts.spotify.com/api/token',
        params: {
          grant_type: 'refresh_token',
          refresh_token: credentials.refreshToken,
        },
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(
            `${this.spotifyConfig.clientId}:${this.spotifyConfig.clientSecret}`,
          ).toString('base64')}`,
        },
      });

      const { access_token, expires_in } = response.data;
      
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);

      await this.spotifyRepository.updateCredentials(userId, {
        accessToken: access_token,
        expiresAt,
      });

      return access_token;
    } catch (error) {
      this.logger.error(`Failed to refresh access token for user ${userId}`, error);
      return null;
    }
  }

  async getValidAccessToken(userId: string): Promise<string | null> {
    const credentials = await this.spotifyRepository.getCredentialsByUserId(userId);
    
    if (!credentials) {
      this.logger.error('No Spotify credentials found for user');
      return null;
    }

    // Check if token is expired or will expire in the next minute
    const now = new Date();
    const expiresAt = new Date(credentials.expiresAt);
    const isExpired = expiresAt.getTime() - now.getTime() < 60000;

    if (isExpired) {
      this.logger.log('Access token expired or expiring soon, refreshing...');
      return await this.refreshAccessToken(userId);
    }

    return credentials.accessToken;
  }

  async disconnectSpotify(userId: string): Promise<boolean> {
    try {
      const result = await this.spotifyRepository.deleteCredentials(userId);
      return result;
    } catch (error) {
      this.logger.error('Failed to disconnect Spotify', error);
      throw new Error('Failed to disconnect Spotify');
    }
  }

  async isUserConnected(userId: string): Promise<boolean> {
    const credentials = await this.spotifyRepository.getCredentialsByUserId(userId);
    return !!credentials;
  }

  async isUserAuthorized(userId: string): Promise<boolean> {
    const credentials = await this.spotifyRepository.getCredentialsByUserId(userId);
    return !!credentials;
  }

  async playTrack(userId: string, trackUri: string): Promise<boolean> {
    const accessToken = await this.getValidAccessToken(userId);

    if (!accessToken) {
      this.logger.error('No valid access token found for user');
      throw new Error('No valid access token found for user');
    }

    try {
      this.logger.log(`Attempting to play track: ${trackUri}`);
      
      // First check if there's an active device
      const deviceResponse = await axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/me/player/devices',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      
      const devices = deviceResponse.data.devices || [];
      this.logger.log(`Found ${devices.length} Spotify devices`);
      
      if (devices.length === 0) {
        throw new Error('No active Spotify device found. Please open Spotify on your device first.');
      }
      
      const activeDevice = devices.find(d => d.is_active) || devices[0];
      
      await axios({
        method: 'put',
        url: 'https://api.spotify.com/v1/me/player/play',
        params: {
          device_id: activeDevice.id
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        data: {
          uris: [trackUri]
        }
      });

      return true;
    } catch (error) {
      const err = error as any;
      this.logger.error('Failed to play track', {
        error: err.message,
        status: err.response?.status,
        data: JSON.stringify(err.response?.data || {})
      });
      
      const errorMessage = err.response?.data?.error?.message;
      
      if (err.response?.status === 404 || errorMessage?.includes('device')) {
        throw new Error('No active Spotify device found. Please open Spotify on your device first.');
      }
      
      if (err.response?.status === 403) {
        if (errorMessage?.includes('premium')) {
          throw new Error('Spotify Premium is required to control playback.');
        } else {
          throw new Error(`Spotify authorization error: ${errorMessage || 'Insufficient permissions'}`);
        }
      }
      
      throw new Error(`Failed to play track: ${errorMessage || err.message}`);
    }
  }

  async pausePlayback(userId: string): Promise<boolean> {
    const accessToken = await this.getValidAccessToken(userId);

    if (!accessToken) {
      this.logger.error('No valid access token found for user');
      throw new Error('No valid access token found for user');
    }

    try {
      this.logger.log(`Attempting to pause playback for user: ${userId}`);
      
      await axios({
        method: 'put',
        url: 'https://api.spotify.com/v1/me/player/pause',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log('Playback paused successfully');
      return true;
    } catch (error) {
      const err = error as any;
      this.logger.error('Failed to pause playback', { 
        error: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 404) {
        throw new Error('No active Spotify device found. Please open Spotify on a device first.');
      }
      
      if (err.response?.status === 403) {
        throw new Error('Spotify Premium is required to control playback.');
      }
      
      throw new Error(`Failed to pause playback: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  async resumePlayback(userId: string): Promise<boolean> {
    const accessToken = await this.getValidAccessToken(userId);

    if (!accessToken) {
      this.logger.error('No valid access token found for user');
      throw new Error('No valid access token found for user');
    }

    try {
      this.logger.log(`Attempting to resume playback for user: ${userId}`);
      
      await axios({
        method: 'put',
        url: 'https://api.spotify.com/v1/me/player/play',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log('Playback resumed successfully');
      return true;
    } catch (error) {
      const err = error as any;
      this.logger.error('Failed to resume playback', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 404) {
        throw new Error('No active Spotify device found. Please open Spotify on a device first.');
      }
      
      if (err.response?.status === 403) {
        throw new Error('Spotify Premium is required to control playback.');
      }
      
      throw new Error(`Failed to pause playback: ${err.response?.data?.error?.message || err.message}`);
    }
  }
  async skipToNext(userId: string): Promise<boolean> {
    const accessToken = await this.getValidAccessToken(userId);

    if (!accessToken) {
      this.logger.error('No valid access token found for user');
      throw new Error('No valid access token found for user');
    }

    try {
      this.logger.log(`Attempting to skip to next track for user: ${userId}`);
      
      await axios({
        method: 'post',
        url: 'https://api.spotify.com/v1/me/player/next',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log('Skipped to next track successfully');
      return true;
    } catch (error) {
      const err = error as any;
      this.logger.error('Failed to skip to next track', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 404) {
        throw new Error('No active Spotify device found. Please open Spotify on a device first.');
      }
      
      if (err.response?.status === 403) {
        throw new Error('Spotify Premium is required to control playback.');
      }
      
      throw new Error(`Failed to pause playback: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  async skipToPrevious(userId: string): Promise<boolean> {
    const accessToken = await this.getValidAccessToken(userId);

    if (!accessToken) {
      this.logger.error('No valid access token found for user');
      throw new Error('No valid access token found for user');
    }

    try {
      this.logger.log(`Attempting to skip to previous track for user: ${userId}`);
      
      await axios({
        method: 'post',
        url: 'https://api.spotify.com/v1/me/player/previous',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log('Skipped to previous track successfully');
      return true;
    } catch (error) {
      const err = error as any;
      this.logger.error('Failed to skip to previous track', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 404) {
        throw new Error('No active Spotify device found. Please open Spotify on a device first.');
      }
      
      if (err.response?.status === 403) {
        throw new Error('Spotify Premium is required to control playback.');
      }
      
      throw new Error(`Failed to pause playback: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  async searchTracks(userId: string, query: string, limit: number = 5): Promise<any> {
    try {
      const accessToken = await this.getValidAccessToken(userId);

      if (!accessToken) {
        this.logger.error('No valid access token found for user');
        throw new Error('No valid access token found for user');
      }

      this.logger.log(`Searching for tracks with query: "${query}"`);
      
      const enhancedQuery = `"${query}"`;
      
      const response = await axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/search',
        params: {
          q: enhancedQuery,
          type: 'track',
          limit: limit
        },
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.data?.tracks?.items?.length) {
        const fallbackResponse = await axios({
          method: 'get',
          url: 'https://api.spotify.com/v1/search',
          params: {
            q: query,
            type: 'track',
            limit: limit
          },
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
        this.logger.log(`Search successful, found ${fallbackResponse.data?.tracks?.items?.length || 0} tracks`);
        return fallbackResponse.data;
      }
      
      if (response.status === 200) {
        this.logger.log(`Search successful, found ${response.data?.tracks?.items?.length || 0} tracks`);
        return response.data;
      } else {
        this.logger.error(`Unexpected response status: ${response.status}`);
        throw new Error(`Unexpected response from Spotify API: ${response.status}`);
      }
    } catch (error) {
      const err = error as any;
      const status = err.response?.status;
      const errorData = err.response?.data;
      
      this.logger.error('Failed to search tracks', {
        status,
        errorMessage: errorData?.error?.message || err.message,
        errorDetails: JSON.stringify(errorData || {})
      });

      // console.log(err.response);
      
      if (status === 401) {
        this.logger.log('Access token expired, refreshing...');
        await this.refreshAccessToken(userId);
        throw new Error('Spotify token expired. Please try again.');
      } else if (status === 403) {
        throw new Error('Spotify authorization error. Please reconnect your account.');
      } else if (status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Failed to search tracks: ${errorData?.error?.message || err.message}`);
      }
    }
  }

  async getCurrentlyPlaying(userId: string): Promise<any> {
    const accessToken = await this.getValidAccessToken(userId);

    if (!accessToken) {
      this.logger.error('No valid access token found for user');
      throw new Error('No valid access token found for user');
    }

    try {
      const response = await axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/me/player/currently-playing',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 204 || !response.data) {
        return null;
      }

      return response.data;
    } catch (error) {
      this.logger.error('Failed to play track', (error as any).response?.data || (error as any).message);

      throw new Error('Failed to fetch currently playing track');
    }
  }

  async setVolume(userId: string, volumePercent: number): Promise<boolean> {
    const accessToken = await this.getValidAccessToken(userId);

    if (!accessToken) {
      this.logger.error('No valid access token found for user');
      throw new Error('No valid access token found for user');
    }

    // Ensure volume is within valid range (0-100)
    volumePercent = Math.max(0, Math.min(100, Math.round(volumePercent)));

    try {
      this.logger.log(`Attempting to set volume to ${volumePercent}% for user: ${userId}`);
      
      await axios({
        method: 'put',
        url: 'https://api.spotify.com/v1/me/player/volume',
        params: {
          volume_percent: volumePercent
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      this.logger.log(`Volume set to ${volumePercent}% successfully`);
      return true;
    } catch (error) {
      const err = error as any;
      this.logger.error('Failed to set volume', {
        error: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      
      if (err.response?.status === 404) {
        throw new Error('No active Spotify device found. Please open Spotify on a device first.');
      }
      
      if (err.response?.status === 403) {
        throw new Error('Spotify Premium is required to control volume.');
      }
      
      throw new Error(`Failed to set volume: ${err.response?.data?.error?.message || err.message}`);
    }
  }
}