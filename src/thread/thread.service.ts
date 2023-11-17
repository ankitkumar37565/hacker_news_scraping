import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CreateThreadDto } from 'src/dto/create-thread.dto';
import { CreateCommentDto } from 'src/dto/create-comment.dto';
import { ISthread } from 'src/interface/thread.interface';
import { IScomment } from 'src/interface/comment.interface';
import { Model } from 'mongoose';
import { UpdateThreadDto } from 'src/dto/update-thread.dto';
// import { UpdateCommentDto } from 'src/dto/update-comment.dto';

import { Query } from 'express-serve-static-core';
@Injectable()
export class ThreadService {
  constructor(
    @InjectModel('Thread') private threadModel: Model<ISthread>,
    @InjectModel('Comment') private commentModel: Model<IScomment>,
  ) {}
  async createThread(createThreadDto: CreateThreadDto): Promise<ISthread> {
    const newThread = await new this.threadModel(createThreadDto).save();
    return newThread;
  }
  async updateThread(
    threadId: string,
    updateThreadDto: UpdateThreadDto,
  ): Promise<ISthread> {
    const existingThread = await this.threadModel.findByIdAndUpdate(
      threadId,
      updateThreadDto,
      { new: true },
    );
    if (!existingThread) {
      throw new NotFoundException(`Thread #${threadId} not found`);
    }
    return existingThread;
  }
  async getAllThreads(query: Query): Promise<[ISthread[], number]> {
    console.log(query);
    interface Search {
      [key: string]: any;
    }
    interface Sort {
      [key: string]: any;
    }
    const search: Search = {};
    if (query.id) {
      search.id = query.id;
    }
    if (query.by) {
      search.by = query.by;
    }
    if (query.title) {
      search.title = {
        $regex: query.title,
        $options: 'i',
      };
    }
    const sort: Sort = {};
    if (query.sortBy) {
      if (query.sortBy == 'score') {
        sort.score = -1;
      } else if (query.sortBy == 'time') {
        sort.time = -1;
      } else if (query.sortBy == 'commentsCount') {
        sort.commentsCount = -1;
      }
    }
    const resPerPage = Number(query.limit) || 10;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);
    const threadData = await this.threadModel
      .find({ ...search })
      .sort({ ...sort })
      .limit(resPerPage)
      .skip(skip);
    const threadCount = await this.threadModel.countDocuments({ ...search });
    if (!threadData || threadData.length == 0) {
      throw new NotFoundException('Threads data not found!');
    }
    return [threadData, threadCount];
  }
  async getThread(threadId: string): Promise<ISthread> {
    const existingThread = await this.threadModel.findById(threadId).exec();
    if (!existingThread) {
      throw new NotFoundException(`Thread #${threadId} not found`);
    }
    return existingThread;
  }
  async createComment(createCommentDto: CreateCommentDto): Promise<IScomment> {
    const newComment = await new this.commentModel(createCommentDto).save();
    return newComment;
  }
  async getComments(
    parentId: number,
    page: number,
    limit: number,
  ): Promise<[IScomment[], number]> {
    const commentData = await this.commentModel
      .find({ parent: parentId })
      .skip(limit * (page - 1))
      .limit(limit);
    const count = await this.commentModel.countDocuments({ parent: parentId });
    if (!commentData) {
      throw new NotFoundException(`Invalid ParentId ${parentId}`);
    }
    return [commentData, count];
  }
}
