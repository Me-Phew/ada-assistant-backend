import { Module } from '@nestjs/common';
import { SpotifyService } from './spotify.service';
import { SpotifyController } from './spotify.controller';
import { SpotifyResolver } from './spotify.resolver';
import { SpotifyRepository } from './repository/spotify.repository';
import { AuthModule } from 'modules/auth/auth.module';
@Module({
  imports: [AuthModule],
  providers: [SpotifyService, SpotifyResolver, SpotifyRepository],
  controllers: [SpotifyController],
  exports: [SpotifyService],
})
export class SpotifyModule {}