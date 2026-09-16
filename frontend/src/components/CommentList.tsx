import React from 'react';
import { type ReactElement } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../util/apiClient';
import Comment from './Comment';
import type { CommentResponse, CommentData } from '../interfaces/Comment';
import type { CommentListProps } from '../interfaces/CommentListProps';

async function fetchComments({
  pageParam,
  queryKey,
}): Promise<CommentData> {
  const data: CommentResponse = 
    (await apiClient.get(`/posts/${queryKey[1]}/comments?before_timestamp=${pageParam.beforeTimestamp}&before_id=${pageParam.beforeId}`)).data;

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
  const queryClient = useQueryClient();

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

  React.useEffect(() => {
      return () => {
        queryClient.removeQueries({ queryKey: ['comments', postId] });
      }
    }, [queryClient, postId]);

  if (preloadedComments.items.length == 0) {
    return <div
      className="
        text-center
        p-1
        rounded-xl
        bg-mist-100
        dark:bg-mist-800
      "
    >
      Без комментариев
    </div>;
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
      <div>
        {comments}
      </div>
      {
        isFetching &&
        <div
          className="text-center bg-mist-100 dark:bg-mist-800 rounded-xl p-1 not-first:mt-2"
        >Загрузка комментариев...</div>
      }
      {
        status == 'error' &&
        <div
          className="text-center bg-mist-100 dark:bg-mist-800 rounded-xl p-1 not-first:mt-2"
        >Ошибка загрузки комментариев</div>
      }
      {
        (status == 'error' || (!isFetched && preloadedComments.hasMore) || (hasNextPage && !isFetching)) &&
        <button
          onClick={() => fetchNextPage()}
          className="
            w-full
            text-center
            mt-2 p-1
            rounded-xl
            bg-mist-100
            dark:bg-mist-800
            hover:cursor-pointer
            hover:bg-mist-50
            hover:dark:bg-mist-900
            transition-colors
          "
        >
          Показать ещё
        </button>
      }
    </div>
  );
}

export default CommentList;