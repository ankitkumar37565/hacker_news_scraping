import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class Thread {
  @Prop()
  by: string;
  @Prop()
  descendants: number;
  @Prop({ required: true, unique: true })
  id: number;
  @Prop()
  score: number;
  @Prop()
  time: number;
  @Prop()
  title: string;
  @Prop()
  type: string;
  @Prop()
  url: string;
  @Prop()
  commentsCount: number;
}
export const threadSchema = SchemaFactory.createForClass(Thread);
