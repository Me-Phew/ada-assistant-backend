export class AdaResponseDto {
  success: boolean;
  responsePath: string;
  isCommand: boolean;
  isPlaybackStartRequest: boolean;
  // Optional playback audio path if command was issued
  playbackAudioPath?: string;
}
