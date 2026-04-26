import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, Req, UseGuards,
} from '@nestjs/common'; // nestjs core decorators
import { AuthGuard } from '@nestjs/passport'; // passport: jwt guard
import { WallPinService } from './wall-pin.service';
import { CreateWallPinDto } from './dto/create-wall-pin.dto';
import { UpdateWallPinDto } from './dto/update-wall-pin.dto';

@Controller('api/wall-pins')
@UseGuards(AuthGuard('jwt'))
export class WallPinController {
  constructor(private readonly wallPinService: WallPinService) {}

  @Get('preview')
  preview(@Query('url') url: string) {
    return this.wallPinService.preview(url);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.wallPinService.findAll(req.user.id);
  }

  @Post()
  create(@Req() req: any, @Body() dto: CreateWallPinDto) {
    return this.wallPinService.create(req.user.id, dto);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: UpdateWallPinDto) {
    return this.wallPinService.update(req.user.id, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.wallPinService.remove(req.user.id, id);
  }
}
