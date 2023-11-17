import { Document } from 'mongoose';
export interface IScomment extends Document {
  readonly by: string;
  readonly id: number;
  readonly kids: Array<number>;
  readonly parent: number;
  readonly text: string;
  readonly time: number;
  readonly type: string;
}
