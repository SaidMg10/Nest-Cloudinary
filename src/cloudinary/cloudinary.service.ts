import { Injectable } from '@nestjs/common';
import {
  v2 as cloudinary,
  UploadApiErrorResponse,
  UploadApiResponse,
} from 'cloudinary';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    const cloudinaryConfig = {
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    };

    cloudinary.config(cloudinaryConfig);
  }
  async uploadImage(
    filePath: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        filePath.path,
        { folder: 'practice' },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        },
      );
    });
  }

  async deleteImage(public_id: string) {
    try {
      // Usamos el public_id para eliminar la imagen
      await cloudinary.uploader.destroy(public_id);
      console.log(`Image with public_id: ${public_id} has been deleted.`);
    } catch (error) {
      console.log(error);
      throw new Error(`Error deleting image with public_id: ${public_id}`);
    }
  }
}
