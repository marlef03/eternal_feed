import type { CommentProps } from '../interfaces/CommentProps';

function Comment({
  id,
  content,
  createdAt,
  authorId,
  authorDisplayName,
  authorUsername,
  authorCreatedAt,
}: CommentProps) {
  return (
    <div>
      <div>{authorDisplayName}</div>
      <div>{'@' + authorUsername}</div>
      <div>{authorCreatedAt.toLocaleString()}</div>
      <p>{content}</p>
      <div>{createdAt.toLocaleString()}</div>
    </div>
  );
}

export default Comment;