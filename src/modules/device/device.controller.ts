import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Device } from 'database/schema/device';
import type { Response } from 'express';
import { Express } from 'express';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { basename, extname, join } from 'path';
import * as superagent from 'superagent';
import { v4 as uuidv4 } from 'uuid';
import yts from 'yt-search';
import { CurrentUser, Public } from '../../common/decorators';
import { User } from '../../database/schema/users';
import { CurrentDevice } from './decorators/current-device.decorator';
import { DeviceService } from './device.service';
import { AdaResponseDto } from './dtos/ada-response.dto';
import { PairDto } from './dtos/inputs/pair.dto';
import { DeviceGuard } from './guards/pairingToken.guard';

const tmpAudioDir = join(process.cwd(), 'tmp', 'audio');

const audioStorage = diskStorage({
  destination: (req, file, cb) => {
    if (!existsSync(tmpAudioDir)) {
      mkdirSync(tmpAudioDir, { recursive: true });
    }
    cb(null, tmpAudioDir);
  },
  filename: (req, file, cb) => {
    const deviceId = req.device.id || 'unknown';
    const timestamp = Date.now();
    cb(null, `${deviceId}_${timestamp}${'.pcm'}`);
  },
});

// File filter for audio files
const audioFileFilter = (req: any, file: Express.Multer.File, cb: any) => {
  const allowedMimeTypes = [
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/webm',
    'audio/flac',
    'application/octet-stream', // ESP32 might send as binary
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new HttpException(
        'Invalid file type. Only audio files are allowed.',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
};

// Test comment

@ApiTags('User Devices')
@ApiBearerAuth()
@Controller('devices')
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);
  // private readonly ytmusic = new YTMusic();

  private recordingsDir: string;
  private responsesDir: string;
  private musicDir: string;

  private recordingsPath: string;
  private responsesPath: string;
  private musicPath: string;

  private aiBackendUrl: string;

  constructor(
    private readonly deviceService: DeviceService,
    private configService: ConfigService,
  ) {
    // this.ytmusic.initialize(/* Optional: Custom cookies */);

    this.recordingsDir = this.configService.get<string>('recordingsDir');
    this.responsesDir = this.configService.get<string>('responsesDir');
    this.musicDir = this.configService.get<string>('musicDir');

    this.recordingsPath = this.configService.get<string>('recordingsPath');
    this.responsesPath = this.configService.get<string>('responsesPath');
    this.musicPath = this.configService.get<string>('musicPath');

    this.aiBackendUrl = this.configService.get<string>('aiBackendUrl');
  }

  @Post('/pair')
  @ApiOperation({
    summary: 'Pair a device with the current user',
  })
  @Public()
  @HttpCode(200)
  async pairDevice(@Body() pairDto: PairDto) {
    return this.deviceService.pairDevice(pairDto);
  }

  @UseGuards(DeviceGuard)
  @Post('/heartbeat')
  @ApiOperation({
    summary: 'Send a heartbeat signal from the device',
  })
  @Public()
  async sendHeartbeat(@CurrentDevice() device: Device) {
    // Logic to handle heartbeat signal
    return {
      message: 'Heartbeat received',
      deviceId: device.id,
    };
  }

  // @UseGuards(DeviceGuard)
  // @Public()
  // @Post('download-youtube-audio')
  // async downloadYoutubeAudio() {
  //   // Don't await here if you want to send an immediate response
  //   // and let the download happen in the background.
  //   // For this example, we'll await and then send the response.
  //   const result = await this.downloadAudioProgressive();

  //   // Option 1: Send back the path (client then needs another way to get the file)
  //   return {
  //     message: 'Audio download and conversion successful.',
  //     filePath: result.filePath,
  //   };
  // }

  @Public()
  @Get('/antyradio')
  async anyradio(@Res() res: Response) {
    const radioUrl = 'https://an05.cdn.eurozet.pl/ant-web.mp3';

    try {
      const stream = superagent.get(radioUrl).buffer(false);

      res.setHeader('Content-Type', 'audio/mpeg');

      stream.pipe(res);
    } catch (error) {
      console.error('Streaming error:', error);
    }
  }

  @Public()
  @Get('/filestream/:dir/:filename')
  async streamfile(
    @Param('dir') dir: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const safeFilename = basename(filename); // prevent path traversal
    const ext = extname(safeFilename);

    const allowedDirs = ['recordings', 'responses', 'music'];
    if (!allowedDirs.includes(dir)) {
      throw new NotFoundException('Invalid directory specified');
    }

    if (ext !== '.mp3') {
      throw new NotFoundException('Only MP3 files are supported');
    }

    const filePath = join(this.musicDir, safeFilename);

    if (!existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    try {
      res.setHeader('Content-Type', 'audio/mpeg');

      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on('error', (err) => {
        console.error('File stream error:', err);
        res.status(500).send('Error streaming file');
      });
    } catch (error) {
      console.error('Streaming error:', error);
      res.status(500).send('Unable to stream audio');
    }
  }

  @Get()
  @ApiOperation({ summary: 'Get all devices assigned to the current user' })
  async getUserDevices(@CurrentUser() user: User) {
    return this.deviceService.getUserDevices(user.id);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a specific device assigned to the current user',
  })
  async getUserDevice(
    @Param('id') deviceId: string,
    @CurrentUser() user: User,
  ) {
    return this.deviceService.getUserDevice(deviceId, user.id);
  }

  @Delete(':id/unpair')
  @ApiOperation({
    summary: 'Unpair a device from the current user',
    description: 'Removes the pairing between user and device',
  })
  @ApiResponse({
    status: 200,
    description: 'Device unpaired successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Device not found or not paired with current user',
  })
  async unpairDevice(@Param('id') deviceId: string, @CurrentUser() user: User) {
    return this.deviceService.unpairDevice(deviceId, user.id);
  }

  @UseGuards(DeviceGuard)
  @Post('/ada')
  @ApiOperation({
    summary: 'Ask Ada a question via audio upload',
    description:
      'Allows ESP32 devices to upload audio files for speech recognition and processing',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Audio file upload',
    schema: {
      type: 'object',
      properties: {
        audio: {
          type: 'string',
          format: 'binary',
          description: 'Audio file (WAV, MP3, OGG, FLAC)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Audio uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        audioId: { type: 'string' },
        filename: { type: 'string' },
        size: { type: 'number' },
        deviceId: { type: 'string' },
        transcription: { type: 'string' },
        responseText: { type: 'string' },
        responsePath: { type: 'string' },
        isCommand: { type: 'boolean' },
        isPlaybackStartRequest: { type: 'boolean' },
        playbackAudioPath: {
          type: 'string',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid file or missing audio',
  })
  @ApiResponse({
    status: 413,
    description: 'File too large',
  })
  @Public()
  @UseInterceptors(
    FileInterceptor('audio', {
      storage: audioStorage,
      fileFilter: audioFileFilter,
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
        files: 1,
      },
    }),
  )
  async useAda(
    @CurrentDevice() device: Device,
    @UploadedFile() audioFile: Express.Multer.File,
  ): Promise<AdaResponseDto | undefined> {
    try {
      if (!audioFile) {
        throw new HttpException(
          'No audio file provided. Please upload an audio file.',
          HttpStatus.BAD_REQUEST,
        );
      }

      this.logger.log(
        `Audio uploaded from device ${device.id}: ${audioFile.filename}`,
      );

      const wavFilePath = `${this.recordingsPath}/${device.id}_${Date.now()}.wav`;

      await new Promise((resolve, reject) => {
        ffmpeg(audioFile.path)
          .inputOptions(['-f s16le', '-ar 16000', '-ac 1'])
          .inputFormat('s16le')
          .audioChannels(1)
          .audioCodec('pcm_s16le')
          .audioFrequency(16000)
          .format('wav')
          .on('end', () => {
            this.logger.log(`Converted PCM to WAV using ffmpeg ${wavFilePath}`);
            // TODO: Maybe delete the original audio file if not needed
            resolve(null);
          })
          .on('error', (err) => {
            this.logger.error(`FFmpeg conversion error: ${err.message}`);
            reject(err);
          })
          .save(wavFilePath);
      });

      let finalTranscription = '';

      const wavBuffer = fs.readFileSync(wavFilePath);

      try {
        const transcriptionResult =
          await this.deviceService.handleSSETranscription(
            wavBuffer,
            audioFile.filename,
          );

        finalTranscription = transcriptionResult;
      } catch (error) {
        this.logger.error(`Error calling STT API: ${error}`);
      }

      this.logger.log(`Transcription result: ${finalTranscription}`);

      const llmResponse = await superagent
        .post(`${this.aiBackendUrl}llm/generate`)
        .set('Content-Type', 'application/json')
        .set('Accept', 'application/json')
        .send({ prompt: finalTranscription })
        .timeout(30000);

      this.logger.log(
        `LLM response for device ${device.id}: ${JSON.stringify(llmResponse.body, null, 4)}`,
      );

      let textToSay = llmResponse.body.response;

      let isPlaybackStartRequest = false;
      let playbackAudioFileName: string | undefined;

      if (llmResponse.body.is_command) {
        this.logger.log(`Device ${device.id} requested command.`);

        switch (llmResponse.body.command_type) {
          case 'music':
            this.logger.log(`Device ${device.id} requested music playback.`);

            isPlaybackStartRequest = true;

            const playbackDataParams = llmResponse.body.command_data.params;

            this.logger.log(
              `Playback data params: ${JSON.stringify(playbackDataParams)}`,
            );

            switch (playbackDataParams.targetPlatform) {
              case 'none': {
                switch (playbackDataParams.action) {
                  case 'play': {
                    this.logger.log(
                      `Device ${device.id} requested to play music.`,
                    );

                    const query = playbackDataParams.query;

                    textToSay = `Odtwarzam ${query}`;

                    const videos = await yts({
                      pages: 1,
                      query,
                      category: 'music',
                    });

                    const firstVideoResult = videos.videos[0];
                    console.log(firstVideoResult);

                    playbackAudioFileName = `${firstVideoResult.videoId}_${Date.now()}.mp3`;

                    const outputPath = join(
                      this.musicPath,
                      playbackAudioFileName,
                    );

                    this.logger.log(`Output MP3 path: ${outputPath}`);

                    this.deviceService.downloadAudioProgressive(
                      firstVideoResult.url,
                      // 'KLuTLF3x9sA',
                      outputPath,
                    );

                    break;
                  }
                  case 'pause': {
                    this.logger.log(
                      `Device ${device.id} requested to pause music.`,
                    );
                    textToSay = `Wstrzymuję muzykę.`;
                    break;
                  }
                  case 'stop': {
                    this.logger.log(
                      `Device ${device.id} requested to stop music.`,
                    );
                    textToSay = `Zatrzymuję muzykę.`;
                    break;
                  }
                }
                break;
              }
              default: {
                // this.logger.warn(
                //   `Device ${device.id} requested unsupported playback platform: ${playbackDataParams.targetPlatfrom}`,
                // );
                // textToSay = `Nie obsługuję tej platformy.`;
                break;
              }
            }
        }
      }

      const responseFileUUID = uuidv4();

      const mp3ResponseFileName = `${responseFileUUID}.mp3`;
      const mp3ResponsefilePath = join(this.responsesPath, mp3ResponseFileName);
      const mp3ResponseFileStream = fs.createWriteStream(mp3ResponsefilePath);

      await new Promise<void>((resolve, reject) => {
        const ttsRequest = superagent
          .post(`${this.aiBackendUrl}tts/synthesize`)
          .set('Content-Type', 'application/json')
          .set('Accept', 'audio/mpeg')
          .send({ text: textToSay })
          .timeout(120000)
          .buffer(false);

        ttsRequest.on('error', (err) => {
          console.error('Superagent request error:', err.message);
          // Ensure stream is closed and attempt to clean up the partially written file
          mp3ResponseFileStream.end(() => {
            fs.unlink(mp3ResponsefilePath, (unlinkErr) => {
              if (unlinkErr)
                console.error(
                  'Error deleting incomplete file after request error:',
                  unlinkErr.message,
                );
            });
          });
          reject(err); // Reject the outer promise
        });

        ttsRequest.on('finish', () => {
          console.log('Finished writing to file');
        });
        ttsRequest.on('error', (err) => {
          console.error('Error:', err);
        });

        ttsRequest.pipe(mp3ResponseFileStream);

        mp3ResponseFileStream
          .on('finish', () => {
            console.log('Finished writing to file:', mp3ResponsefilePath);
            resolve(); // Resolve the outer promise on successful write
          })
          .on('error', (err) => {
            console.error('Error writing to file stream:', err.message);
            // File stream errored, file might be corrupt. Attempt cleanup.
            // The stream should ideally close itself on error, but unlinking is good.
            fs.unlink(mp3ResponsefilePath, (unlinkErr) => {
              if (unlinkErr)
                console.error(
                  'Error deleting incomplete file after stream error:',
                  unlinkErr.message,
                );
            });
            reject(err); // Reject the outer promise
          });
      });

      const response: AdaResponseDto = {
        success: true,
        responsePath: `${this.responsesDir}/${mp3ResponseFileName}`,
        isCommand: llmResponse.body.is_command || false,
        isPlaybackStartRequest,
      };

      if (isPlaybackStartRequest) {
        response.playbackAudioPath = `${this.musicDir}/${playbackAudioFileName}`;
      }

      return response;
    } catch (error) {
      this.logger.error(
        `Error processing audio upload from device ${device.id}:`,
        error,
      );

      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        'Internal server error while processing audio upload',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
