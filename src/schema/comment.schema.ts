import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import * as uniqueValidator from 'mongoose-unique-validator';
@Schema()
export class Comment {
  @Prop()
  by: string;
  @Prop({ required: true, unique: true })
  id: number;
  @Prop()
  kids: Array<number>;
  @Prop()
  parent: number;
  @Prop()
  text: string;
  @Prop()
  time: number;
  @Prop()
  type: string;
}
export const commentSchema = SchemaFactory.createForClass(Comment);
