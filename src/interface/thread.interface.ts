import { Document } from 'mongoose';
export interface ISthread extends Document {
  readonly by: string;
  readonly descendants: number;
  readonly id: number;
  score: number;
  commentsCount: number;
  readonly time: number;
  readonly title: string;
  readonly type: string;
  readonly url: string;
}
