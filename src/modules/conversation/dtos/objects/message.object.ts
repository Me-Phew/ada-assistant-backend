import { Field, ID, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum MessageType {
  USER = 'user',
  ASSISTANT = 'assistant',
}

registerEnumType(MessageType, {
  name: 'MessageType',
  description: 'Type of message (user or assistant)',
});

@ObjectType('Message')
export class MessageObject {
  @Field(() => ID)
  id!: string;

  @Field(() => MessageType)
  type!: MessageType;

  @Field()
  content!: string;

  @Field({ nullable: true })
  audioPath?: string;

  @Field()
  timestamp!: Date;
}