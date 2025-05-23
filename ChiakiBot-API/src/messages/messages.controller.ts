import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  Put,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  StreamableFile,
  NotFoundException,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PaginationFilter } from '../shared/dtos/pagination-filter';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'node:process';

@Controller('api/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async createAsync(@Body() createMessageDto: CreateMessageDto) {
    return await this.messagesService.createAsync(createMessageDto);
  }

  @Get()
  findPaginateAsync(@Query() paginationFilter: PaginationFilter, @Query('active') active: string) {
    const { pageSize = 10, pageNumber = 1 } = paginationFilter || new PaginationFilter();
    const isActive = active === 'true';
    return this.messagesService.findPaginateAsync(
      {
        pageNumber: pageNumber,
        pageSize: pageSize,
      },
      isActive,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.messagesService.findMessageByCodeMessageAsync(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateMessageDto: UpdateMessageDto) {
    return this.messagesService.updateAsync(id, updateMessageDto);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.messagesService.deactivateAsync(id);
  }

  @Patch(':id')
  async reactivate(@Param('id') id: number) {
    return await this.messagesService.reactivateAsync(id);
  }

  @Patch('add-media-to-message/:id')
  @UseInterceptors(FileInterceptor('file'))
  async addMediaToMessage(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2_500_000 }),
          new FileTypeValidator({ fileType: /(jpeg|jpg|png|gif)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Param('id')
    id: number,
  ) {
    return await this.messagesService.addImageOrGifToMessageAsync(id, file);
  }

  @Get('upload/:fileName')
  async getMessageImage(@Param('fileName') fileName: string) {
    const filePath = path.join(process.cwd(), `uploads/${fileName}`);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Imagem não encontrada');
    }

    const file = fs.createReadStream(filePath);
    return new StreamableFile(file);
  }
}
