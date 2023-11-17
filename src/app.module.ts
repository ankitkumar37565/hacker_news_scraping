import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { threadSchema } from './schema/thread.schema';
import { commentSchema } from './schema/comment.schema';
import { failedThreadSchema } from './schema/failedThread.schema';
import { ThreadService } from './thread/thread.service';
import { ThreadController } from './thread/thread.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { CronjobsService } from './cronjobs/cronjobs.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017', {
      dbName: 'hackerNews',
    }),
    MongooseModule.forFeature([{ name: 'Thread', schema: threadSchema }]),
    MongooseModule.forFeature([{ name: 'Comment', schema: commentSchema }]),
    MongooseModule.forFeature([
      { name: 'FailedThread', schema: failedThreadSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, ThreadController],
  providers: [AppService, ThreadService, CronjobsService],
})
export class AppModule {}
