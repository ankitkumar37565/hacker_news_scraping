import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  Cron,
  //   CronExpression,
  //   Interval,
  //   Timeout,
  SchedulerRegistry,
} from '@nestjs/schedule';
import { ISthread } from 'src/interface/thread.interface';
import { IScomment } from 'src/interface/comment.interface';
import { ISFailedThread } from 'src/interface/failedThread.interface';
import { Model } from 'mongoose';
import { CreateThreadDto } from 'src/dto/create-thread.dto';
import { CreateCommentDto } from 'src/dto/create-comment.dto';

// import { CreateFailedThreadDto } from 'src/dto/create-failedThread.dto';
// import { CreateThreadDto } from 'src/dto/create-thread.dto';
// import { UpdateThreadDto } from 'src/dto/update-thread.dto';
// import { AxiosRequestConfig } from "axios";
import axios from 'axios';
// import { map, catchError } from 'rxjs';
// interface scraperTools {
//   cache: { [key: string]: any };
//   allowedWorkers?: number;
//   scrapeStatus?: boolean;
//   workers?: { [key: string]: any };
// }
const workers: { [key: string]: any } = {};
const cache: { [key: string]: any } = {};
const allowedWorkers: number = 5;
const workerRequestInterval: number = 100; //ms
let killswitch: boolean = false;
// let scrapeStatus: boolean = false;

@Injectable()
export class CronjobsService {
  constructor(
    @InjectModel('Thread') private threadModel: Model<ISthread>,
    @InjectModel('Comment') private commentModel: Model<IScomment>,
    @InjectModel('FailedThread')
    private failedThreadModel: Model<ISFailedThread>,
    private readonly schedulerRegistry: SchedulerRegistry,
    // public scraperTools: scraperTools,
    // public cache: {
    //   [key: string]: any;
    // },
    // public allowedWorkers: number,
    // public scrapeStatus: boolean,
    // public workers: { [key: string]: any },
  ) {
    // cache = {};
    // allowedWorkers = 2;
    // scrapeStatus = false;
    // workers = {};
  }
  async sleep(ms: number) {
    return new Promise((resolve) => {
      //   console.log('sleeping', ms / 1000, 'second');
      setTimeout(resolve, ms);
    });
  }
  //   @Cron('0 */1  * * * *', { name: 'yccombinator' })
  @Cron('0 0 0 * * *', { name: 'yccombinator' })
  async startjob() {
    // killswitch = false;
    this.startScrapeJob();
  }
  async startcronjob() {
    let job: any;
    try {
      job = this.schedulerRegistry.getCronJob('yccombinator');
      //   console.log('job', job);
    } catch (err) {
      console.log('error @ finding job', err);
      //   return { message: 'error finding cron job' };
    }
    if (job) {
      job.start();
      return { message: 'cron started running' };
    } else {
      Cron('0 0 0 */1 * *', { name: 'yccombinator' });
      this.startScrapeJob();
      return { message: 'cron started sucessfully' };
    }
  }

  stopCronJob(name: string) {
    const job = this.schedulerRegistry.getCronJob(name);
    if (job) {
      job.stop();
      killswitch = true;
      console.log(name, ' cron job stopped');
      return { message: 'cron stopped sucessfully' };
    } else {
      console.log(name, ' job not found');
      return { message: 'cron not found' };
    }
  }
  async startScrapeJob() {
    killswitch = false;
    console.log(
      `cron job scraping start for url: https://hacker-news.firebaseio.com/v0`,
    );
    let running = false;
    for (const worker in workers) {
      if (workers[worker] == true) {
        running = true;
        console.log('workers already running');
      }
    }
    if (!running) this.scrapeHackerNews();
  }
  async scrapeHackerNews() {
    let startingPoint: number = 1;
    let threadLastId: number = 0;
    let commentLastId: number = 0;
    const threadData = await this.threadModel
      .find({})
      .sort({ id: -1 })
      .limit(1);
    const commentData = await this.commentModel
      .find({})
      .sort({ id: -1 })
      .limit(1);
    if (threadData && threadData.length > 0) {
      threadLastId = Number(threadData[0]['id']);
    }
    if (commentData && commentData.length > 0) {
      commentLastId = Number(commentData[0]['id']);
    }
    if (threadLastId || commentLastId) {
      if (threadLastId >= commentLastId) startingPoint = threadLastId + 1;
      else startingPoint = threadLastId + 1;
    }
    // startingPoint = 1;
    // console.log(threadLastId, commentLastId, startingPoint);
    const response = await axios.get(
      'https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty',
    );
    if (response.status == 200 && response.data) {
      const maxitem = Number(response.data);
      console.log(
        'startingPoint is :',
        startingPoint,
        'latest thread id is :',
        maxitem,
      );
      if (maxitem >= startingPoint) {
        //start srcaping
        const url = `https://hacker-news.firebaseio.com/v0/item`;
        //initialize cache
        cache.fetchedTill = startingPoint - 1;
        cache.fetchUpto = maxitem;
        // cache.hackerNewsAllIds={} //-1,0,1,2 for not initialized,requestmade,requestSucess,requestFailed
        cache.hackerNewsFailedIds = []; // to save the failed Ids to retry again
        // for (let i = startingPoint; i <= maxitem; i++) {
        //   cache.hackerNewsAllIds[i] = -1; //after all worker finished loop thorough hackerNewsAllIds to check at last whether all ids response sucess
        // }
        //start workers
        for (let i = 1; i <= allowedWorkers; i++) {
          this.scrape(url, i);
        }
      } else {
        console.log('scrape alredy updated till last thread:', maxitem);
      }
    } else {
      console.log('response @ scrapeHackerNews:maxitem', response);
      console.log('failed to load latest id try again ');
    }
  }
  async scrape(url: string, id: number) {
    // const threadToPush = [];
    // const commentToPush = [];
    workers[id] = true;
    // scrapeStatus = true;
    // let count = 0;
    for (
      let i = cache.fetchedTill + allowedWorkers - id + 1;
      i <= cache.fetchUpto;
      i += allowedWorkers
    ) {
      if (killswitch) {
        workers[id] = false;
        break;
      }
      // while (cache.fetchedTill <= cache.fetchUpto) {
      //   cache.fetchedTill += 1;
      //   if (count == 10) break;
      //   count++;
      //   if (cache.hackerNewsAllIds[i] == -1) {
      // cache.hackerNewsAllIds[i] = 0;
      //   console.log('scrapeWorker id:', id, 'making request for threadid:', i);
      const Url = url + `/${i}.json`;
      try {
        const response = await axios.get(Url);

        if (response && response.status == 200 && response.data) {
          if (response.data.id == i) {
            // cache.hackerNewsAllIds[i] = 1;
            if (response.data.type == 'comment') {
              const data: CreateCommentDto = {
                by: response.data.by,
                id: response.data.id,
                kids: response.data.kids ? response.data.kids : [],
                parent: response.data.parent,
                text: response.data.text,
                time: response.data.time,
                type: response.data.type,
              };
              console.log('data', data.id);
              try {
                await new this.commentModel(data).save();
              } catch (error) {
                console.log('error @ saving commentModel:', error);
                cache.hackerNewsFailedIds.push(i);
              }
              await this.threadModel.updateOne(
                { id: response.data.parent },
                { $inc: { commentsCount: 1 } },
                { new: true },
              );
              //   commentToPush.push(response.data);
            } else if (response.data.type == 'story') {
              const data: CreateThreadDto = {
                by: response.data.by,
                descendants: response.data.descendants,
                id: response.data.id,
                score: response.data.score,
                time: response.data.time,
                title: response.data.title,
                type: response.data.type,
                url: response.data.url,
                commentsCount: 0,
              };
              console.log('data', data.id);
              try {
                await new this.threadModel(data).save();
              } catch (error) {
                console.log('error @ saving threadModel :', error);
                cache.hackerNewsFailedIds.push(i);
              }
              //   threadToPush.push(response.data);
            }
          } else {
            console.log('invalid data:', response.data);
          }
        } else {
          cache.hackerNewsFailedIds.push(i);
        }
        //   }
      } catch (error) {
        console.log('error @ response:', error);
      }
      await this.sleep(workerRequestInterval);
    }
    workers[id] = false;

    if (cache.hackerNewsFailedIds.length > 0) {
      const failedThread = await this.failedThreadModel.findOne({});
      if (failedThread) {
        await this.failedThreadModel.updateOne(
          { _id: failedThread._id },
          { $push: cache.hackerNewsFailedIds },
        );
      } else {
        const failedThread = await new this.failedThreadModel({
          ids: [],
        }).save();
        await this.failedThreadModel.updateOne(
          { _id: failedThread._id },
          { $push: cache.hackerNewsFailedIds },
        );
      }
    }
  }
}
