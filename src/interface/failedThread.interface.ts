import { Document } from 'mongoose';
export interface ISFailedThread extends Document {
  readonly ids: Array<number>;
}
