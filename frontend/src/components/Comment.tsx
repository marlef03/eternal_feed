import type { CommentProps } from '../interfaces/CommentProps';

function Comment({
  id,
  content,
  postId,
  authorId,
  createdAt,
}: CommentProps) {
  return (
    <div>
      <div>{'ID комментария: ' + id}</div>
      <div>{'ID пользователя ' + authorId}</div>
      <div>{'Дата создания: ' + createdAt}</div>
      <p>{content}</p>
    </div>
  );
}

export default Comment;