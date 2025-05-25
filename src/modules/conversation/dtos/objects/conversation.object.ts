import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('Conversation')
export class ConversationObject {
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
}