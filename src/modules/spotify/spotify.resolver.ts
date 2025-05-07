import { Resolver, Query, Mutation, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { JwtGuard } from 'common/guards/jwt.guard';
import { SpotifyConnectionObject } from './dtos/objects/spotify-connection.object';

@Resolver()
export class SpotifyResolver {
  constructor(private readonly spotifyService: SpotifyService) {}

  @UseGuards(JwtGuard)
  @Query(() => SpotifyConnectionObject)
  async spotifyConnection(@Context() context: any): Promise<SpotifyConnectionObject> {
    const userId = context.req.user.id;
    const connected = await this.spotifyService.isUserConnected(userId);
    
    if (connected) {
      return { connected: true };
    }
    
    const state = Buffer.from(JSON.stringify({ userId })).toString('base64');
    const authUrl = this.spotifyService.getAuthorizationUrl(userId, state);
    
    return {
      connected: false,
      authUrl,
    };
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async disconnectSpotify(@Context() context: any): Promise<boolean> {
    const userId = context.req.user.id;
    return this.spotifyService.disconnectSpotify(userId);
  }
}