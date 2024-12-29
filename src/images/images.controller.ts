import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { CreateImageDto } from './dto/create-image.dto';
import { UpdateImageDto } from './dto/update-image.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
// import { CloudinaryService } from 'src/common/services/cloudinary.service..v2';

@Controller('images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  @Post()
  create(@Body() createImageDto: CreateImageDto) {
    return this.imagesService.create(createImageDto);
  }

  @Get()
  findAll() {
    return this.imagesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.imagesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
    return this.imagesService.update(id, updateImageDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.imagesService.remove(id);
  // }
  //* Cloudinary Controllers
  @Post('cloudinary')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() createImageDto: CreateImageDto,
  ) {
    return this.imagesService.uploadToCloudinary(file, createImageDto);
  }
  @Patch('cloudinary/:id')
  @UseInterceptors(FileInterceptor('file'))
  async updateFile(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() updateImageDto: UpdateImageDto,
  ) {
    return this.imagesService.updateToCloudinary(id, file, updateImageDto);
  }
  @Delete('cloudinary/:id')
  @UseInterceptors(FileInterceptor('file'))
  async removeImage(@Param('id') id: string) {
    return this.imagesService.removeImage(id);
  }
}
