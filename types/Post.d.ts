/**
 * Post
 * A Post
 */
declare interface Post {
    id?: number;
    title: string;
    content?: string | null;
    published: boolean;
    viewCount: number;
    createdAt: string;
    userId?: number | null;
}
export { Post };
