import ytdl from '@distube/ytdl-core';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import { Readable } from 'stream';
import * as superagent from 'superagent';
import { DeviceRepository } from '../admin/repository/device.repository';
import { PairDto } from './dtos/inputs/pair.dto';

@Injectable()
export class DeviceService {
  private readonly logger = new Logger(DeviceService.name);

  private aiBackendUrl: string;

  constructor(
    private readonly deviceRepository: DeviceRepository,
    private configService: ConfigService,
  ) {
    this.aiBackendUrl = this.configService.get<string>('aiBackendUrl');
  }

  async downloadAudioProgressive(
    url: string,
    outputPath: string,
  ): Promise<{
    filePath: string;
    message: string;
  }> {
    return new Promise(async (resolve, reject) => {
      const info = await ytdl.getInfo(url);
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');

      if (!audioFormats.length) {
        return reject(
          new InternalServerErrorException(
            'No suitable audio-only formats found.',
          ),
        );
      }

      const preferredFormats = audioFormats
        .filter(
          (f) =>
            f.audioCodec?.includes('opus') ||
            f.audioCodec?.includes('aac') ||
            f.audioCodec?.includes('mp4a'),
        )
        .sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0));

      const chosenFormat = preferredFormats[0] || audioFormats[0];

      this.logger.log(
        `Chosen format: ${chosenFormat.container}, Codec: ${chosenFormat.audioCodec}, Bitrate: ${chosenFormat.audioBitrate} kbps, URL: ${chosenFormat.url}`,
      );

      let ffmpegCommand: ffmpeg.FfmpegCommand | undefined;
      let downloadStream: Readable | undefined;
      let isResolved = false;

      const cleanup = () => {
        if (
          downloadStream &&
          typeof downloadStream.destroy === 'function' &&
          !downloadStream.destroyed
        ) {
          downloadStream.destroy();
          this.logger.log('Download stream destroyed.');
        }
        if (ffmpegCommand && typeof ffmpegCommand.kill === 'function') {
          try {
            ffmpegCommand.kill('SIGTERM'); // or 'SIGKILL' if SIGTERM is not enough
            this.logger.log('FFmpeg process killed.');
          } catch (e) {
            this.logger.warn(
              `Attempted to kill FFmpeg, but failed (possibly already exited): ${e}`,
            );
          }
        }
      };

      const handleError = (error: any, source: string) => {
        if (isResolved) return;
        isResolved = true;

        const errorMessage =
          error instanceof Error ? error.message : String(error);
        this.logger.error(`${source} error: ${errorMessage}`, error.stack);

        cleanup();

        if (fs.existsSync(outputPath)) {
          fs.unlink(outputPath, (unlinkErr) => {
            if (unlinkErr) {
              this.logger.error(
                `Failed to delete partial file: ${outputPath}`,
                unlinkErr.stack,
              );
            } else {
              this.logger.log(
                `Successfully deleted partial file: ${outputPath}`,
              );
            }
          });
        }

        reject(
          new InternalServerErrorException(`${source} error: ${errorMessage}`),
        );
      };

      try {
        this.logger.log('Starting download stream from ytdl-core...');

        downloadStream = ytdl.downloadFromInfo(info, {
          format: chosenFormat,
          // ytdl-core uses miniget which has its own timeout handling.
          // You can pass requestOptions for miniget if needed:
          // requestOptions: { timeout: 60000 } // e.g., 60s inactivity timeout
        });

        downloadStream.on('error', (err) => {
          handleError(err, 'YTDL Download Stream');
        });

        // Some versions of miniget/ytdl-core might emit 'timeout' separately
        downloadStream.on('timeout', () => {
          handleError(
            new Error('Download stream timed out (ytdl/miniget)'),
            'YTDL Download Stream Timeout',
          );
        });

        this.logger.log('Setting up FFmpeg command...');
        ffmpegCommand = ffmpeg(downloadStream) // Pass stream directly
          .inputFormat(chosenFormat.container) // Specify the format of the input stream
          .audioCodec('libmp3lame')
          .audioBitrate(192) // Target bitrate for MP3
          .audioChannels(1)
          .format('mp3')
          .outputOptions(['-avoid_negative_ts', 'make_zero']) // Useful for piped/streamed inputs
          .on('start', (commandLine) => {
            this.logger.log(
              'FFmpeg process started with command: ' + commandLine,
            );
          })
          .on('progress', (progress) => {
            if (progress.percent) {
              this.logger.log(
                `FFmpeg Processing: ${progress.percent.toFixed(2)}% done`,
              );
            } else if (progress.timemark) {
              this.logger.log(
                `FFmpeg Processing: Timemark ${progress.timemark}`,
              );
            }
          })
          .on('error', (err, stdout, stderr) => {
            // Ignore SIGTERM/SIGKILL errors as they are expected if we called cleanup()
            if (
              err.message.includes('SIGTERM') ||
              err.message.includes('SIGKILL')
            ) {
              this.logger.log('FFmpeg process was terminated as expected.');
              return;
            }
            this.logger.error('FFmpeg stderr output:\n' + stderr);
            handleError(err, 'FFmpeg');
          })
          .on('end', () => {
            if (isResolved) return; // Already handled (e.g. by an error)
            isResolved = true;
            this.logger.log(
              'FFmpeg processing finished. MP3 saved to ' + outputPath,
            );
            resolve({
              filePath: outputPath,
              message: 'Download and conversion complete.',
            });
          });

        this.logger.log('Starting FFmpeg processing (saving to output)...');
        ffmpegCommand.save(outputPath);
      } catch (error) {
        // This will catch synchronous errors from ytdl.getInfo, ytdl.downloadFromInfo, or ffmpeg setup
        handleError(error, 'Setup/Sync');
      }
    });
  }

  parseSSEResponse(
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
  async handleSSETranscription(
    wavBuffer: Buffer,
    fileName: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let accumulatedData = '';
      let finalTranscription = '';

      const request = superagent
        .post(`${this.aiBackendUrl}stt/transcribe`)
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

  /**
   * Get all devices assigned to a specific user
   */
  async getUserDevices(userId: string) {
    this.logger.log(`Fetching devices for user ${userId}`);
    return this.deviceRepository.getUserDevices(userId);
  }

  /**
   * Get details for a specific device assigned to a user
   */
  async getUserDevice(deviceId: string, userId: string) {
    const device = await this.deviceRepository.getUserDeviceById(
      deviceId,
      userId,
    );

    if (!device) {
      this.logger.warn(
        `Device ${deviceId} not found or not assigned to user ${userId}`,
      );
      throw new NotFoundException('Device not found or not assigned to you');
    }

    return device;
  }

  /**
   * Pair a device with a user
   */
  async pairDevice(pairDto: PairDto) {
    const device = await this.deviceRepository.getDeviceBySerialNumber(
      pairDto.serialNumber,
    );

    if (!device) {
      this.logger.warn(`Device ${pairDto.serialNumber} not found`);
      throw new NotFoundException('Device not found');
    }

    await this.deviceRepository.pairDeviceWithUser(
      pairDto.serialNumber,
      pairDto.userId,
    );
    this.logger.log(
      `Device ${pairDto.serialNumber} paired with user ${pairDto.userId}`,
    );

    const pairingData = await this.deviceRepository.createPairingToken(
      pairDto.serialNumber,
    );

    return {
      message: 'Device paired successfully',
      device: {
        serialNumber: pairDto.serialNumber,
        userId: pairDto.userId,
      },
      ...pairingData,
    };
  }

  async authenticateWithPairingToken(token: string) {
    const device = await this.deviceRepository.getDeviceByPairingToken(token);

    if (!device) {
      throw new UnauthorizedException('Invalid pairing token');
    }

    return device;
  }

  async unpairDevice(
    deviceId: string,
    userId: string,
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(
      `Attempting to unpair device ${deviceId} for user ${userId}`,
    );

    const device = await this.deviceRepository.getUserDeviceById(
      deviceId,
      userId,
    );

    if (!device) {
      this.logger.warn(
        `Device ${deviceId} not found or not assigned to user ${userId}`,
      );
      throw new NotFoundException('Device not found or not assigned to you');
    }

    const result = await this.deviceRepository.unpairDevice(deviceId, userId);

    if (result) {
      this.logger.log(
        `Device ${deviceId} successfully unpaired from user ${userId}`,
      );
      return {
        success: true,
        message: 'Device unpaired successfully',
      };
    } else {
      this.logger.warn(`Failed to unpair device ${deviceId}`);
      return {
        success: false,
        message: 'Failed to unpair device',
      };
    }
  }
}
