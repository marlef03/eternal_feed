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
  comments,
}: PostProps) {
  return (
    <div>
      <div>{authorDisplayName}</div>
      <div>{'@' + authorUsername}</div>
      <div>{authorCreatedAt.toLocaleString()}</div>
      <h2>{title}</h2>
      <p>{content}</p>
      <div>{createdAt.toLocaleString()}</div>
      <h3>Комментарии</h3>
      <CommentList postId={id} preloadedComments={comments}/>
    </div>
  );
}

export default Post;