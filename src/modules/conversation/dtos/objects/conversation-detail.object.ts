import { Field, ID, ObjectType } from '@nestjs/graphql';
import { MessageObject } from './message.object';

@ObjectType('ConversationDetail')
export class ConversationDetailObject {
  @Field(() => ID)
  id!: string;

  @Field({ nullable: true })
  startDatetime?: Date;

  @Field()
  createdAt!: Date;

  @Field({ nullable: true })
  deviceName?: string;

  @Field({ nullable: true })
  deviceModel?: string;

  @Field(() => [MessageObject])
  messages!: MessageObject[];
}