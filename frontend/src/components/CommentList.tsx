import { type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../util/apiClient';
import Comment from './Comment';
import type { CommentResponse, CommentData } from '../interfaces/Comment';
import type { CommentListProps } from '../interfaces/CommentListProps';

async function fetchComments({
  pageParam,
  queryKey,
}): Promise<CommentData> {
  let data: CommentResponse;
  if (pageParam.beforeTimestamp) {
    data = (await apiClient.get(`/posts/${queryKey[1]}/comments?before_timestamp=${pageParam.beforeTimestamp}&before_id=${pageParam.beforeId}`)).data;
  } else {
    data = (await apiClient.get(`/posts/${queryKey[1]}/comments`)).data;
  }

  return {
    items: data.items.map(
      (item) => ({
        id: item.id,
        content: item.content,
        createdAt: new Date(item.created_at),
        author: {
          id: item.author.id,
          displayName: item.author.display_name,
          username: item.author.username,
          createdAt: new Date(item.author.created_at),
        }
      })
    ),
    hasMore: data.has_more,
  };
}

function CommentList({
  postId,
  preloadedComments,
}: CommentListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetched,
    status,
  } = useInfiniteQuery<CommentData>({
    queryKey: ['comments', postId],
    queryFn: fetchComments,
    initialPageParam: {
      beforeTimestamp: preloadedComments.items.at(-1)?.createdAt.toISOString(),
      beforeId: preloadedComments.items.at(-1)?.id,
    },
    getNextPageParam: (lastPage) => {
      if (!preloadedComments.hasMore || !lastPage.hasMore) return undefined;

      return {
        beforeTimestamp: lastPage.items.at(-1)?.createdAt.toISOString(),
        beforeId: lastPage.items.at(-1)?.id,
      };
    },
    enabled: false,
  });

  if (status == 'error') {
    return <div>Ошибка загрузки</div>
  }

  const comments: ReactElement[] = preloadedComments.items.map(
    (comment) => (
      <Comment
        key={comment.id}
        id={comment.id}
        content={comment.content}
        createdAt={comment.createdAt}
        authorId={comment.author.id}
        authorDisplayName={comment.author.displayName}
        authorUsername={comment.author.username}
        authorCreatedAt={comment.author.createdAt}
      />
  ))

  if (data) {
    data.pages.forEach((page) => {
      comments.push(...page.items.map(
        (comment) => (
          <Comment
            key={comment.id}
            id={comment.id}
            content={comment.content}
            createdAt={comment.createdAt}
            authorId={comment.author.id}
            authorDisplayName={comment.author.displayName}
            authorUsername={comment.author.username}
            authorCreatedAt={comment.author.createdAt}
          />
        )
      ))
    });
  }
  
  return (
    <div>
      {comments}
      {
        isFetching && <div>Загрузка...</div>
      }
      {
        ((!isFetched && preloadedComments.hasMore) || (hasNextPage && !isFetching)) &&
        <button
          onClick={() => fetchNextPage()}
        >
          Показать ещё
        </button>
      }
    </div>
  );
}

export default CommentList;