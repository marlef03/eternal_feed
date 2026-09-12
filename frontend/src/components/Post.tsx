import CommentList from './CommentList';
import type { PostProps } from '../interfaces/PostProps';

function Post({
  id,
  title,
  content,
  createdAt,
  authorId,
  authorDisplayName,
  authorUsername,
  authorCreatedAt,
}: PostProps) {
  return (
    <div>
      <div>{authorDisplayName}</div>
      <div>{'@' + authorUsername}</div>
      <h2>{title}</h2>
      <p>{content}</p>
      <div>{createdAt.toLocaleString()}</div>
      <h3>Комментарии</h3>
      <CommentList postId={id} />
    </div>
  );
}

export default Post;