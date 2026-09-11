import { type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../util/apiClient';
import Comment from './Comment';
import type { CommentResponse, CommentData } from '../interfaces/Comment';
import type { CommentListProps } from '../interfaces/CommentListProps';

async function fetchComments({
  pageParam,
  queryKey,
}) {
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
        postId: item.post_id,
        authorId: item.author_id,
        createdAt: new Date(item.created_at),
      })
    ),
    hasMore: data.has_more,
  };
}

function CommentList({ postId }: CommentListProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
  } = useInfiniteQuery<CommentData>({
    queryKey: ['comments', postId],
    queryFn: fetchComments,
    initialPageParam: {
      beforeTimestamp: undefined,
      beforeId: undefined,
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore) return undefined;

      return {
        beforeTimestamp: lastPage.items.at(-1)?.createdAt.toISOString(),
        beforeId: lastPage.items.at(-1)?.id,
      };
    }
  });

  if (status == 'pending') {
    return <div>Загрузка...</div>
  }

  if (status == 'error') {
    return <div>Ошибка загрузки</div>
  }

  const comments: ReactElement[] = []

  data.pages.forEach((page) => {
    comments.push(...page.items.map(
      (comment) => (
        <Comment
          key={comment.id}
          id={comment.id}
          content={comment.content}
          authorId={comment.authorId}
          postId={comment.postId}
          createdAt={comment.createdAt}
        />
      )
    ))
  });
  
  return (
    <div>
      {comments}
      {
        isFetchingNextPage && <div>Загрузка...</div>
      }
      {
        hasNextPage && !isFetchingNextPage &&
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