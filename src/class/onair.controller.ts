import { Body, Controller, Post } from '@nestjs/common';
import { ClassService } from './class.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('stream')
@ApiTags('stream')
export class OnAirController {
  constructor(private classService: ClassService) {}
  //방송 스트림키 확인
  @Post('/check')
  @ApiOperation({
    summary: '스트림키 확인',
    description: '스트림키를 확인한다',
  })
  @ApiOkResponse({ description: '맞는지 틀린지 보내준다' })
  checkClass(@Body() Dto) {
    return this.classService.checkClass(Dto);
  }

  //방송 온에어
  @Post('/onair')
  @ApiOperation({
    summary: '방송시작',
    description: '방송시작을 DB에 저장한다.',
  })
  @ApiOkResponse({ description: '방송시작을 DB에 저장한다.' })
  onAirClass(@Body() Dto) {
    return this.classService.OnAndOffAirClass(Dto, 'on');
  }

  //방송 오프에어
  @Post('/offair')
  @ApiOperation({
    summary: '방송종료',
    description: '방송종료를 DB에 저장한다.',
  })
  @ApiOkResponse({ description: '방송종료를 DB에 저장한다.' })
  offAirClass(@Body() Dto) {
    return this.classService.OnAndOffAirClass(Dto, 'off');
  }
}
