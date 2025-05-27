import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Logger,
  Param,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Device } from 'database/schema/device';
import * as fs from 'fs'; // For reading file if using diskStorage
import * as superagent from 'superagent';
import { CurrentUser, Public } from '../../common/decorators';
import { User } from '../../database/schema/users';
import { CurrentDevice } from './decorators/current-device.decorator';
import { DeviceService } from './device.service';
import { PairDto } from './dtos/inputs/pair.dto';
import { DeviceGuard } from './guards/pairingToken.guard';

import { HttpException, HttpStatus, UploadedFile } from '@nestjs/common';

import { Express } from 'express';
import { existsSync, mkdirSync } from 'fs';
// import { memoryStorage } from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import { diskStorage } from 'multer';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// const audioStorage = memoryStorage();

// Configure multer for audio file storage
const audioStorage = diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = join(process.cwd(), 'uploads', 'audio');
    if (!existsSync(uploadPath)) {
      mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and device info
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

@ApiTags('User Devices')
@ApiBearerAuth()
@Controller('devices')
export class DeviceController {
  private readonly logger = new Logger(DeviceController.name);

  private audioDir = join(__dirname, '../../../..', 'public', 'audio');

  constructor(private readonly deviceService: DeviceService) {
    if (!existsSync(this.audioDir)) {
      mkdirSync(this.audioDir, { recursive: true });
    }

    console.log(`Audio directory initialized at: ${this.audioDir}`);
  }

  // Helper method to parse SSE responses (if needed for streaming)
  private parseSSEResponse(
    responseText: string,
  ): Array<{ event?: string; data: string }> {
    const events: Array<{ event?: string; data: string }> = [];
    const lines = responseText.split('\n');

    let currentEvent: { event?: string; data: string } = { data: '' };

    for (const line of lines) {
      if (line.startsWith('event: ')) {
        currentEvent.event = line.substring(7).trim();
      } else if (line.startsWith('data: ')) {
        currentEvent.data = line.substring(6).trim();
        events.push({ ...currentEvent });
        currentEvent = { data: '' };
      } else if (line.trim() === '') {
        // Empty line indicates end of event
        if (currentEvent.data) {
          events.push({ ...currentEvent });
          currentEvent = { data: '' };
        }
      }
    }

    return events;
  }
  // Helper method to handle SSE transcription with proper streaming
  private async handleSSETranscription(
    wavBuffer: Buffer,
    fileName: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let accumulatedData = '';
      let finalTranscription = '';

      const request = superagent
        .post('http://192.168.1.13:9000/stt/transcribe')
        .set('Accept', 'text/event-stream')
        .attach('file', wavBuffer, fileName)
        .buffer(false)
        .timeout(30000);

      request.on('response', (res) => {
        this.logger.log('SSE connection established');

        res.on('data', (chunk) => {
          const chunkStr = chunk.toString();
          this.logger.log(
            `Received SSE chunk (${chunk.length} bytes):`,
            JSON.stringify(chunkStr),
          );
          accumulatedData += chunkStr;

          // Parse each line as it comes in
          const lines = chunkStr.split('\n');
          for (const line of lines) {
            console.log('Processing line:', JSON.stringify(line));

            if (line.startsWith('data: ')) {
              const jsonData = line.substring(6).trim();
              // try {
              const parsedData = JSON.parse(jsonData);

              if (
                parsedData.type === 'done' ||
                parsedData.message === 'Transcription complete.'
              ) {
                finalTranscription =
                  parsedData.full_text || parsedData.text || '';
                this.logger.log(
                  'Transcription completed:',
                  JSON.stringify(finalTranscription),
                );
                // Don't resolve here - wait for stream to end
              } else if (parsedData.full_text || parsedData.text) {
                // Update with partial transcription
                finalTranscription = parsedData.full_text || parsedData.text;
                this.logger.log(
                  'Partial transcription:',
                  JSON.stringify(finalTranscription),
                );
              }
              // } catch (parseError) {
              //   this.logger.warn(
              //     'Failed to parse JSON line:',
              //     JSON.stringify(line),
              //     'Error:',
              //     parseError,
              //   );
              // }
            }
          }
        });

        res.on('end', () => {
          this.logger.log(
            'SSE stream ended. Final transcription:',
            JSON.stringify(finalTranscription),
          );
          this.logger.log(
            'Total accumulated data:',
            JSON.stringify(accumulatedData),
          );
          if (finalTranscription) {
            resolve(finalTranscription);
          } else {
            reject(new Error('No transcription received from SSE stream'));
          }
        });

        res.on('error', (error) => {
          this.logger.error('SSE stream error:', error);
          reject(error);
        });
      });

      request.on('error', (error) => {
        this.logger.error('Request error:', error);
        reject(error);
      });

      // Start the request
      request.end();
    });
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
  ) {
    // try {
    // Validate that audio file was uploaded
    if (!audioFile) {
      throw new HttpException(
        'No audio file provided. Please upload an audio file.',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(
      `Audio uploaded from device ${device.id}: ${audioFile.filename}`,
    );

    // let pcmBuffer: Buffer;
    // if (audioFile.buffer) {
    //   // If memoryStorage is used
    //   pcmBuffer = audioFile.buffer;
    // } else if (audioFile.path) {
    //   // If diskStorage is used
    //   pcmBuffer = fs.readFileSync(audioFile.path);
    // } else {
    //   throw new HttpException(
    //     'Audio file data is missing.',
    //     HttpStatus.BAD_REQUEST,
    //   );
    // }

    // const wav = new WaveFile();
    // wav.from(1, 16000, '16', pcmBuffer);
    // const wavUint8Array = wav.toBuffer();
    // const wavBuffer = Buffer.from(wavUint8Array);

    //  save wavBuffer to disk if needed
    const wavFilePath = join(
      process.cwd(),
      'uploads',
      'audio',
      `${device.id}_${Date.now()}.wav`,
    );
    // fs.writeFileSync(wavFilePath, wavBuffer);

    // this.logger.log(
    //   `Converted PCM to WAV. WAV size: ${wavBuffer.length} bytes`,
    // );

    await new Promise((resolve, reject) => {
      ffmpeg(audioFile.path)
        .inputOptions(['-f s16le', '-ar 16000', '-ac 1'])
        .inputFormat('s16le') // 16-bit little-endian PCM
        .audioChannels(1) // mono
        .audioCodec('pcm_s16le') // PCM 16-bit little-endian
        .audioFrequency(16000) // 16kHz sample rate
        .format('wav')
        .on('end', () => {
          this.logger.log(`Converted PCM to WAV using ffmpeg`);
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

    // try {
    // Alternative approach: Use a more robust streaming handler
    const transcriptionResult = await this.handleSSETranscription(
      wavBuffer,
      audioFile.filename,
    );

    finalTranscription = transcriptionResult;
    // } catch (error) {
    //   this.logger.error('Error calling STT API:', error);
    // }

    const llmResponse = await superagent
      .post('http://192.168.1.13:9000/llm/generate')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({ prompt: transcriptionResult })
      .timeout(30000);

    console.log('RESPONSE:', llmResponse.body);

    let textToSay = llmResponse.body.response;

    if (llmResponse.body.is_command) {
      textToSay = `Odtwarzam przez wbudowany głośnik`;
    }

    const ttsResponse = await superagent
      .post('http://192.168.1.13:9000/tts/synthesize')
      .set('Content-Type', 'application/json')
      .set('Accept', 'application/json')
      .send({ text: textToSay })
      .timeout(60000);

    console.log('Response:', ttsResponse.body);

    const responseFileUUID = uuidv4();

    const wavResponseFileName = `${responseFileUUID}.wav`;
    const wavResponsefilePath = join(this.audioDir, wavResponseFileName);
    fs.writeFileSync(wavResponsefilePath, ttsResponse.body);

    const mp3ResponseFileName = `${responseFileUUID}.mp3`;
    const mp3ResponsefilePath = join(this.audioDir, mp3ResponseFileName);

    await new Promise((resolve, reject) => {
      ffmpeg(wavResponsefilePath)
        .inputFormat('wav')
        .audioChannels(1)
        .audioFrequency(44100)
        .audioCodec('libmp3lame')
        .audioBitrate('48k')
        .format('mp3')
        .on('end', () => {
          this.logger.log(`Converted WAV to MP3 using ffmpeg`);
          resolve(null);
        })
        .on('error', (err) => {
          this.logger.error(`FFmpeg conversion error: ${err.message}`);
          reject(err);
        })
        .save(mp3ResponsefilePath);
    });

    return {
      success: true,
      isCommand: llmResponse.body.isCommand || false,
      isPlaybackStartRequest: false,
      message: 'Audio uploaded successfully and transcribed',
      transcription: finalTranscription,
      responsePath: `static/audio/${mp3ResponseFileName}`,
    };
    // } catch (error) {
    //   this.logger.error(
    //     `Error processing audio upload from device ${device.id}:`,
    //     error,
    //   );

    //   if (error instanceof HttpException) {
    //     throw error;
    //   }

    //   throw new HttpException(
    //     'Internal server error while processing audio upload',
    //     HttpStatus.INTERNAL_SERVER_ERROR,
    //   );
    // }
  }
}
