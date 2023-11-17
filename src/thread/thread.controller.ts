import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Res,
  Query,
} from '@nestjs/common';
import { CreateThreadDto } from 'src/dto/create-thread.dto';
import { CreateCommentDto } from 'src/dto/create-comment.dto';
import { UpdateThreadDto } from 'src/dto/update-thread.dto';
import { ThreadService } from 'src/thread/thread.service';
import { CronjobsService } from 'src/cronjobs/cronjobs.service';
import { Query as ExpressQuery } from 'express-serve-static-core';
@Controller('thread')
export class ThreadController {
  constructor(
    private readonly threadService: ThreadService,
    private readonly cronjobsService: CronjobsService,
  ) {}
  @Post()
  async createThread(
    @Res() response,
    @Body() createThreadDto: CreateThreadDto,
  ) {
    try {
      const newThread = await this.threadService.createThread(createThreadDto);
      return response.status(HttpStatus.CREATED).json({
        message: 'Thread has been created successfully',
        newThread,
      });
    } catch (err) {
      console.log(err);
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: 'Error: Thread not created!',
        error: 'Bad Request',
      });
    }
  }
  @Put('/:id')
  async updateThread(
    @Res() response,
    @Param('id') threadId: string,
    @Body() updateThreadDto: UpdateThreadDto,
  ) {
    try {
      const existingThread = await this.threadService.updateThread(
        threadId,
        updateThreadDto,
      );
      return response.status(HttpStatus.OK).json({
        message: 'Thread has been successfully updated',
        existingThread,
      });
    } catch (err) {
      console.log(err);
      return response.status(err.status).json(err.response);
    }
  }
  @Get()
  async getThreads(@Res() response, @Query() query: ExpressQuery) {
    try {
      const threadData = await this.threadService.getAllThreads(query);
      return response.status(HttpStatus.OK).json({
        message: 'All threads data found successfully',
        threadData: threadData[0],
        count: threadData[1],
      });
    } catch (err) {
      console.log(err);
      return response.status(err.status).json(err.response);
    }
  }
  @Get('/:id')
  async getThread(@Res() response, @Param('id') threadId: string) {
    try {
      const existingThread = await this.threadService.getThread(threadId);
      return response.status(HttpStatus.OK).json({
        message: 'Thread found successfully',
        existingThread,
      });
    } catch (err) {
      console.log(err);
      return response.status(err.status).json(err.response);
    }
  }
  @Post('/comment')
  async createComment(
    @Res() response,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    try {
      const newThread =
        await this.threadService.createComment(createCommentDto);
      return response.status(HttpStatus.CREATED).json({
        message: 'Thread has been created successfully',
        newThread,
      });
    } catch (err) {
      console.log(err);
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: 'Error: Thread not created!',
        error: 'Bad Request',
      });
    }
  }
  @Get('/comments')
  async getComments(@Res() response, @Query() query: ExpressQuery) {
    try {
      const threadData = await this.threadService.getComments(
        Number(query.parentId),
        Number(query.page),
        Number(query.limit),
      );
      return response.status(HttpStatus.OK).json({
        message: 'All threads data found successfully',
        threadData: threadData[0],
        count: threadData[1],
      });
    } catch (err) {
      console.log(err);

      return response.status(err.status).json(err.response);
    }
  }
  @Post('/startCron')
  async startCron(@Res() response, @Body() startcron: { [key: string]: any }) {
    try {
      if (startcron.name == 'yccombinator') {
        const res = await this.cronjobsService.startcronjob();
        return response.status(HttpStatus.CREATED).json({
          message: res,
        });
      } else {
        return response.status(400).json({
          message: 'invalid name',
        });
      }
    } catch (err) {
      console.log(err);
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: 'Cron not started',
        error: 'Bad Request',
      });
    }
  }
  @Post('/stopCron')
  async stopCron(@Res() response, @Body() stopcron: { [key: string]: any }) {
    try {
      if (stopcron.name == 'yccombinator') {
        const respnse = await this.cronjobsService.stopCronJob(stopcron.name);
        return response.status(HttpStatus.CREATED).json({
          respnse: respnse,
        });
      } else {
        return response.status(400).json({
          message: 'invalid name',
        });
      }
    } catch (err) {
      console.log(err);
      return response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: 400,
        message: 'Cron not started',
        error: 'Bad Request',
      });
    }
  }
}
