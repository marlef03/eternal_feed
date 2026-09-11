import CommentList from './CommentList';
import type { PostProps } from '../interfaces/PostProps';

function Post({
  id,
  title,
  content,
  authorId,
  createdAt,
}: PostProps) {
  return (
    <div key={id}>
      <hr />
      <h2>{title}</h2>
      <p>{content}</p>
      <div>{'ID поста ' + id}</div>
      <div>{'ID автора ' + authorId}</div>
      <div>{'Дата создания: ' + createdAt}</div>
      <hr />
      <h3>Комментарии</h3>
      <CommentList postId={id} />
      <hr />
    </div>
  );
}

export default Post;