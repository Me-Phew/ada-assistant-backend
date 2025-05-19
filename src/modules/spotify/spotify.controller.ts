import { Controller, Get, Post, Query, Res, Req, UseGuards, Body, Logger } from '@nestjs/common';
import { Response, Request } from 'express';
import { SpotifyService } from './spotify.service';
import { JwtGuard } from 'common/guards/jwt.guard';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from 'config/configuration';
import { Public } from 'common/decorators';
import { Roles } from 'common/decorators/roles.decorator';
import { UserRole } from '../../database/schema/common/role.enum';

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
  @Post('callback')
  async handleCallbackFromFrontend(
    @Body() body: { code: string; state: string },
    @Res() res: Response,
  ) {
    if (!body.code || !body.state) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing code or state parameter' 
      });
    }

    try {
      const { userId } = JSON.parse(Buffer.from(body.state, 'base64').toString());

      if (!userId) {
        return res.status(400).json({ 
          success: false, 
          message: 'Invalid state parameter' 
        });
      }

      const success = await this.spotifyService.exchangeCodeForTokens(body.code, userId);

      if (success) {
        return res.status(200).json({ 
          success: true, 
          message: 'Spotify account connected successfully' 
        });
      } else {
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to connect Spotify account' 
        });
      }
    } catch (error) {
      this.logger.error('Error processing Spotify callback from frontend:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error',
      });
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
        return res.status(400).json({ 
          message: 'Query parameter is required', 
          success: false 
        });
      }
      
      try {
        const searchResults = await this.spotifyService.searchTracks(userId, body.query, 20);
        
        if (!searchResults?.tracks?.items?.length) {
          return res.status(404).json({ 
            message: `No tracks found matching query: "${body.query}"`, 
            success: false 
          });
        }
        
        // Try to find the best match by looking for artist + track name matches
        const tracks = searchResults.tracks.items;
        let bestMatch = tracks[0];
        
        // Extract artist and track name from the query (if in format "Artist track name")
        const queryLower = body.query.toLowerCase();
        const queryParts = queryLower.split(' ');
        
        if (queryParts.length > 1) {
          // Try to find tracks where both artist and track name match parts of the query
          const betterMatches = tracks.filter(track => {
            const artistNamesLower = track.artists.map(a => a.name.toLowerCase());
            const trackNameLower = track.name.toLowerCase();
            
            // Check if any artist name is found in the query
            const artistMatch = artistNamesLower.some(name => queryLower.includes(name));
            // Check if track name is found in the query
            const trackMatch = queryParts.some(part => 
              trackNameLower.includes(part) && part.length > 3);
              
            return artistMatch && trackMatch;
          });
          
          if (betterMatches.length > 0) {
            bestMatch = betterMatches[0];
            this.logger.log(`Found better match: "${bestMatch.artists[0].name} - ${bestMatch.name}"`);
          }
        }
        
        this.logger.log(`Selected track to play: "${bestMatch.artists[0].name} - ${bestMatch.name}"`);
        
        try {
          const trackUri = bestMatch.uri;
          const success = await this.spotifyService.playTrack(userId, trackUri);
        
          if (success) {
            return res.status(200).json({ 
              message: 'Track is playing',
              success: true,
              track: {
                name: bestMatch.name,
                artist: bestMatch.artists[0].name,
                album: bestMatch.album.name,
                uri: trackUri,
                image: bestMatch.album.images[0]?.url
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

  @UseGuards(JwtGuard)
  @Post('pause')
  async pausePlayback(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    try {
      const success = await this.spotifyService.pausePlayback(userId);

      if (success) {
        return res.status(200).json({ 
          message: 'Playback paused',
          success: true
        });
      } else {
        return res.status(400).json({ 
          message: 'Failed to pause playback',
          success: false
        });
      }
    } catch (error) {
      this.logger.error('Error pausing playback:', error);
      return res.status(500).json({
        message: (error as Error).message || 'Internal server error',
        success: false
      });
    }
  }

  @UseGuards(JwtGuard)
  @Post('resume')
  async resumePlayback(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    try {
      const success = await this.spotifyService.resumePlayback(userId);

      if (success) {
        return res.status(200).json({ 
          message: 'Playback resumed',
          success: true
        });
      } else {
        return res.status(400).json({ 
          message: 'Failed to resume playback',
          success: false
        });
      }
    } catch (error) {
      this.logger.error('Error resuming playback:', error);
      return res.status(500).json({
        message: (error as Error).message || 'Internal server error',
        success: false
      });
    }
  }

  @UseGuards(JwtGuard)
  @Post('next')
  async skipToNext(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    try {
      const success = await this.spotifyService.skipToNext(userId);

      if (success) {
        return res.status(200).json({ 
          message: 'Skipped to next track',
          success: true
        });
      } else {
        return res.status(400).json({ 
          message: 'Failed to skip to next track',
          success: false
        });
      }
    } catch (error) {
      this.logger.error('Error skipping to next track:', error);
      return res.status(500).json({
        message: (error as Error).message || 'Internal server error',
        success: false
      });
    }
  }

  @UseGuards(JwtGuard)
  @Post('previous')
  async skipToPrevious(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    try {
      const success = await this.spotifyService.skipToPrevious(userId);

      if (success) {
        return res.status(200).json({ 
          message: 'Skipped to previous track',
          success: true
        });
      } else {
        return res.status(400).json({ 
          message: 'Failed to skip to previous track',
          success: false
        });
      }
    } catch (error) {
      this.logger.error('Error skipping to previous track:', error);
      return res.status(500).json({
        message: (error as Error).message || 'Internal server error',
        success: false
      });
    }
  }

  @UseGuards(JwtGuard)
  @Post('volume')
  async setVolume(
    @Req() req: Request,
    @Body() body: { volume: number },
    @Res() res: Response,
  ) {
    const userId = req.user.id;

    try {
      if (typeof body.volume !== 'number' || isNaN(body.volume)) {
        return res.status(400).json({ 
          message: 'Volume must be a number between 0 and 100',
          success: false
        });
      }

      const success = await this.spotifyService.setVolume(userId, body.volume);

      if (success) {
        return res.status(200).json({ 
          message: `Volume set to ${Math.round(body.volume)}%`,
          success: true,
          volume: Math.round(body.volume)
        });
      } else {
        return res.status(400).json({ 
          message: 'Failed to set volume',
          success: false
        });
      }
    } catch (error) {
      this.logger.error('Error setting volume:', error);
      return res.status(500).json({
        message: (error as Error).message || 'Internal server error',
        success: false
      });
    }
  }

  @UseGuards(JwtGuard)
  @Post('refresh')
  async refreshSpotifyToken(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    try {
      const isConnected = await this.spotifyService.isUserConnected(userId);
      
      if (!isConnected) {
        return res.status(400).json({ 
          message: 'No Spotify connection found. Please connect your Spotify account first.',
          success: false
        });
      }
      
      const newAccessToken = await this.spotifyService.refreshAccessToken(userId);
      
      if (newAccessToken) {
        return res.status(200).json({ 
          message: 'Spotify token refreshed successfully',
          success: true
        });
      } else {
        return res.status(400).json({ 
          message: 'Failed to refresh Spotify token',
          success: false
        });
      }
    } catch (error) {
      this.logger.error('Error refreshing Spotify token:', error);
      return res.status(500).json({
        message: 'Internal server error while refreshing Spotify token',
        success: false
      });
    }
  }

  @UseGuards(JwtGuard)
  @Get('token-info')
  async getSpotifyTokenInfo(@Req() req: Request, @Res() res: Response) {
    const userId = req.user.id;

    try {
      const credentials = await this.spotifyService.getSpotifyCredentials(userId);
      
      if (!credentials) {
        return res.status(404).json({ 
          message: 'No Spotify connection found',
          connected: false,
          success: false
        });
      }
      
      const now = new Date();
      const expiresAt = new Date(credentials.expiresAt);
      const isExpired = expiresAt < now;
      const expiresIn = Math.floor((expiresAt.getTime() - now.getTime()) / 1000);
      
      return res.status(200).json({
        connected: true,
        success: true,
        accessToken: credentials.accessToken,
        expiresAt: credentials.expiresAt,
        isExpired: isExpired,
        expiresIn: isExpired ? 0 : expiresIn,
        connectedSince: credentials.createdAt
      });
    } catch (error) {
      this.logger.error('Error retrieving Spotify token info:', error);
      return res.status(500).json({
        message: 'Internal server error while retrieving Spotify token info',
        success: false
      });
    }
  }

  @UseGuards(JwtGuard)
  @Roles(UserRole.ADMIN)
  @Get('all-connections')
  async getAllSpotifyConnections(@Res() res: Response) {
    try {
      const connections = await this.spotifyService.getAllConnections();
      return res.status(200).json({ connections });
    } catch (error) {
      this.logger.error('Error fetching Spotify connections:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}