import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType('SpotifyConnection')
export class SpotifyConnectionObject {
  @Field(() => Boolean)
  connected!: boolean;

  @Field(() => String, { nullable: true })
  authUrl?: string;
}