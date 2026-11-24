import type { PostProps } from "../interfaces/PostProps";
import { getDateString } from "../util/helperFunctions";
import CommentList from "./CommentList";
import ReloadButton from "./ReloadButton";

function Post({
  id,
  title,
  content,
  createdAt,
  authorDisplayName,
  authorUsername,
  comments,
}: PostProps) {
  return (
    <div className="w-full bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-1 shadow-md mb-3 mt-1">
      <div className="flex justify-between items-center p-1.5 pl-2.5 pr-2.5 bg-mist-200 dark:bg-mist-700 rounded-xl">
        <div>{`${authorDisplayName} (@${authorUsername})`}</div>
        <div className="text-xs">{getDateString(createdAt)}</div>
      </div>
      <div className="p-3">
        <h2>{title}</h2>
        <pre>{content}</pre>
      </div>
      <div className="relative p-1 bg-mist-200 dark:bg-mist-700 rounded-2xl">
        <ReloadButton
          queryKeys={[["comments", id]]}
          className="
            absolute
            right-0
            top-0
            mt-0.5
            mr-0.5
            size-8
          "
          title="Обновить комментарии"
        />
        <div className="text-center p-1 mb-1">Комментарии</div>
        <CommentList postId={id} preloadedComments={comments} />
      </div>
    </div>
  );
}

export default Post;
