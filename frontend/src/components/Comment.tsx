import type { CommentProps } from "../interfaces/CommentProps";
import { getDateString } from "../util/helperFunctions";

function Comment({
  content,
  createdAt,
  authorDisplayName,
  authorUsername,
}: CommentProps) {
  return (
    <div className="bg-mist-100 dark:bg-mist-800 rounded-xl p-1">
      <div className="flex justify-between items-center p-1.5 pl-2.5 pr-2.5 bg-mist-200 dark:bg-mist-700 rounded-xl">
        <div>{`${authorDisplayName} (@${authorUsername})`}</div>
        <div className="text-xs">{getDateString(createdAt)}</div>
      </div>
      <pre className="p-2">{content}</pre>
    </div>
  );
}

export default Comment;
