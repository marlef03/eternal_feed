import CommentList from './CommentList';
import type { PostProps } from '../interfaces/PostProps';
import { getDateString } from '../util/helperFunctions';

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
    <div
      className="w-full bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-1 shadow-md mb-3 mt-1"
    >
      <div
        className="flex justify-between items-center p-1.5 pl-2.5 pr-2.5 bg-mist-200 dark:bg-mist-700 rounded-xl"
      >
        <div>
          {`${authorDisplayName} (@${authorUsername})`}
        </div>
        <div
          className="text-xs"
        >
          {getDateString(createdAt)}
        </div>
      </div>
      <div
        className="p-3"
      >
        
        <h2>{title}</h2>
        <p>{content}</p>
      </div>
      <div
        className="p-1 bg-mist-200 dark:bg-mist-700 rounded-2xl"
      >
        <div className="text-center p-1 mb-1">Комментарии</div>
        <CommentList postId={id} preloadedComments={comments}/>
      </div>
    </div>
  );
}

export default Post;