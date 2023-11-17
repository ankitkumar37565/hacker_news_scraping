import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
@Schema()
export class failedThread {
  @Prop({ required: true, unique: true })
  ids: Array<number>;
}
export const failedThreadSchema = SchemaFactory.createForClass(failedThread);
