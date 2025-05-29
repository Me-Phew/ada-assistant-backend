export class AdaResponseDto {
  success: boolean;
  transcription: string;
  responseText: string;
  responsePath: string;
  isCommand: boolean;
  isPlaybackStartRequest: boolean;
  // Optional playback audio path if command was issued
  playbackAudioPath?: string;
}
