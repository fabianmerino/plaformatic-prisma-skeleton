import { Movie } from './Movie'
import { User } from './User'
import { Post } from './Post'
import { Device } from './Device'
  
  interface EntityTypes  {
    Movie:Movie
    User:User
    Post:Post
    Device:Device
  }
  
  export { EntityTypes ,Movie,User,Post,Device }