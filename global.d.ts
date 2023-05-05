import { Entity } from '@platformatic/sql-mapper';
import graphqlPlugin from '@platformatic/sql-graphql'
import { EntityTypes, Device,Movie,Post,User } from './types'

declare module 'fastify' {
  interface FastifyInstance {
    getSchema<T extends 'Device' | 'Movie' | 'Post' | 'User'>(schemaId: T): {
      '$id': string,
      title: string,
      description: string,
      type: string,
      properties: {
        [x in keyof EntityTypes[T]]: { type: string, nullable?: boolean }
      },
      required: string[]
    };
  }
}

declare module '@platformatic/sql-mapper' {
  interface Entities {
    device: Entity<Device>,
    movie: Entity<Movie>,
    post: Entity<Post>,
    user: Entity<User>,
  }
}
