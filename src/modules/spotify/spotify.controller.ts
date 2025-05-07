import { Controller, Get, Post, Query, Res, Req, UseGuards, Body, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { SpotifyService } from './spotify.service';
import { JwtGuard } from 'common/guards/jwt.guard';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'config/configuration';
import { Public } from 'common/decorators';

@Controller('spotify')
export class SpotifyController {
  private readonly logger = new Logger(SpotifyController.name);

  constructor(
    private readonly spotifyService: SpotifyService,
    private readonly configService: ConfigService<AppConfig>,
  ) {}

  @UseGuards(JwtGuard)
  @Get('auth')
  async authorize(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    const authUrl = this.spotifyService.getAuthorizationUrl(userId, state);
    return res.redirect(authUrl);
  }

  @Public()
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Query('error') error: string,
    @Res() res: Response,
  ) {
    if (error) {
      return res.status(400).json({ message: 'Spotify authorization failed', error });
    }

    try {
      const { userId } = JSON.parse(Buffer.from(state, 'base64').toString());

      const success = await this.spotifyService.exchangeCodeForTokens(code, userId);

      if (success) {
        return res.status(200).json({ message: 'Spotify connected successfully' });
      } else {
        return res.status(400).json({ message: 'Failed to connect Spotify' });
      }
    } catch (e) {
      console.error('Error processing Spotify callback:', e);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @Post('play')
  async playTrack(
    @Req() req: Request,
    @Body() body: { query?: string },
    @Res() res: Response,
  ) {
    const userId = req.user.id;
    
    try {
      this.logger.log(`Play request received with body: ${JSON.stringify(body)}`);
      
      if (!body.query) {
        return res.status(400).json({ message: 'Query parameter is required' });
      }
      
      try {
        const searchResults = await this.spotifyService.searchTracks(userId, body.query, 1);
        
        if (!searchResults?.tracks?.items?.length) {
          return res.status(404).json({ 
            message: `No tracks found matching query: "${body.query}"`, 
            success: false 
          });
        }
        
        const track = searchResults.tracks.items[0];
        const trackUri = track.uri;
        
        try {
          const success = await this.spotifyService.playTrack(userId, trackUri);
        
          if (success) {
            return res.status(200).json({ 
              message: 'Track is playing',
              success: true,
              track: {
                name: track.name,
                artist: track.artists[0].name,
                album: track.album.name,
                uri: trackUri,
                image: track.album.images[0]?.url
              }
            });
          } else {
            return res.status(400).json({ 
              message: 'Failed to play track', 
              success: false 
            });
          }
        } catch (playError) {
          const errorMessage = (playError as Error).message;
          this.logger.error(`Error playing track: ${errorMessage}`);
          return res.status(400).json({ 
            message: errorMessage || 'Failed to play track',
            success: false,
            error: 'PLAYBACK_ERROR'
          });
        }
      } catch (searchError) {
        const errorMessage = (searchError as Error).message;
        this.logger.error(`Error searching tracks: ${errorMessage}`);
        return res.status(400).json({ 
          message: errorMessage || 'Failed to search for tracks',
          success: false,
          error: 'SEARCH_ERROR'
        });
      }
    } catch (error) {
      this.logger.error('Error playing track:', error);
      return res.status(500).json({ 
        message: 'Error playing track',
        success: false,
        error: (error as Error).message
      });
    }
  }

  @UseGuards(JwtGuard)
  @Get('status')
  async getSpotifyStatus(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    try {
      const isAuthorized = await this.spotifyService.isUserAuthorized(userId);
      return res.status(200).json({ authorized: isAuthorized });
    } catch (error) {
      console.error('Error checking Spotify status:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @UseGuards(JwtGuard)
  @Post('disconnect')
  async disconnectSpotify(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    try {
      const success = await this.spotifyService.disconnectSpotify(userId);

      if (success) {
        return res.status(200).json({ message: 'Spotify disconnected successfully' });
      } else {
        return res.status(400).json({ message: 'Failed to disconnect Spotify' });
      }
    } catch (error) {
      console.error('Error disconnecting Spotify:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  @UseGuards(JwtGuard)
  @Post('reconnect')
  async reconnectSpotify(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    try {
      // First disconnect
      await this.spotifyService.disconnectSpotify(userId);
      
      // Then generate a new auth URL
      const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
      const authUrl = this.spotifyService.getAuthorizationUrl(userId, state);
      
      return res.status(200).json({ 
        message: 'Please reconnect your Spotify account with the required permissions',
        authUrl: authUrl
      });
    } catch (error) {
      this.logger.error('Error reconnecting Spotify:', error);
      return res.status(500).json({ message: 'Error reconnecting Spotify' });
    }
  }

  @UseGuards(JwtGuard)
  @Get('currently-playing')
  async getCurrentlyPlaying(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    try {
      const currentlyPlaying = await this.spotifyService.getCurrentlyPlaying(userId);

      if (!currentlyPlaying) {
        return res.status(200).json({ message: 'No track is currently playing' });
      }

      return res.status(200).json(currentlyPlaying);
    } catch (error) {
      console.error('Error fetching currently playing track:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}