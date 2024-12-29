import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Image } from './entities/image.entity';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private readonly imageRepository: Repository<Image>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async create(createImageDto: CreateImageDto) {
    try {
      const image = this.imageRepository.create(createImageDto);
      return await this.imageRepository.save(image);
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async findAll() {
    const images = await this.imageRepository.find();
    if (images.length === 0) {
      throw new NotFoundException('No images found');
    }
    return images;
  }

  async findOne(id: string) {
    const image = await this.imageRepository.findOneBy({ id });
    if (!image) throw new NotFoundException('Image not found');
    return image;
  }

  async update(id: string, updateImageDto: UpdateImageDto) {
    try {
      const { url } = updateImageDto;
      const image = await this.imageRepository.preload({ id, url });
      if (!image) throw new BadRequestException('Image not found');
      await this.imageRepository.save(image);
      return image;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async remove(id: string) {
    const image = await this.findOne(id);
    if (!image) throw new BadRequestException('Image not found');
    await this.imageRepository.remove(image);
    return 'Image deleted successfully';
  }

  //* Cloudinary Methods
  async uploadToCloudinary(
    file: Express.Multer.File,
    createImageDto: CreateImageDto,
  ) {
    try {
      const { secure_url, public_id } =
        await this.cloudinaryService.uploadImage(file);
      const image = this.imageRepository.create({
        url: secure_url,
        public_id,
        ...createImageDto,
      });
      await this.imageRepository.save(image);
      return image;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async updateToCloudinary(
    id: string,
    file: Express.Multer.File,
    updateImageDto: UpdateImageDto,
  ) {
    try {
      const image = await this.imageRepository.preload({
        id,
        ...updateImageDto,
      });
      if (!image)
        throw new BadRequestException('La imagen que busca no existe');
      if (image.public_id)
        await this.cloudinaryService.deleteImage(image.public_id);

      const { secure_url, public_id } =
        await this.cloudinaryService.uploadImage(file);

      image.public_id = public_id;
      image.url = secure_url;

      const updatedImage = await this.imageRepository.save(image);
      return updatedImage;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async updated(id: string, updateImageDto: UpdateImageDto) {
    try {
      const { url } = updateImageDto;
      const image = await this.imageRepository.preload({ id, url });
      if (!image) throw new BadRequestException('Image not found');
      await this.imageRepository.save(image);
      return image;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async removeImage(id: string) {
    const image = await this.findOne(id);
    if (!image)
      throw new BadRequestException('La imagen que intenta eliminar no existe');
    try {
      if (image.public_id)
        await this.cloudinaryService.deleteImage(image.public_id);
      await this.imageRepository.remove(image);
      return 'Eliminación de la imagen exitosa';
    } catch (error) {
      console.log(error);
    }
  }
}
