import React from 'react';
import { type ReactElement } from 'react';
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import apiClient from '../util/apiClient';
import ScrollObserver from './ScrollObserver';
import Post from './Post';
import type { PostResponse, PostData } from '../interfaces/Post';

async function fetchPosts({ pageParam }): Promise<PostData[]> {
  let data: PostResponse[];
  if (pageParam.beforeTimestamp) {
    data = (await apiClient.get(`/posts?before_timestamp=${pageParam.beforeTimestamp}&before_id=${pageParam.beforeId}`)).data;
  } else {
    data = (await apiClient.get('/posts')).data;
  }

  return data.map(
    (item) => ({
      id: item.id,
      title: item.title,
      content: item.content,
      createdAt: new Date(item.created_at),
      author: {
        id: item.author.id,
        displayName: item.author.display_name,
        username: item.author.username,
        createdAt: new Date(item.author.created_at),
      },
      comments: {
        items: item.comments.items.map((comment) => ({
          id: comment.id,
          content: comment.content,
          createdAt: new Date(comment.created_at),
          author: {
            id: comment.author.id,
            displayName: comment.author.display_name,
            username: comment.author.username,
            createdAt: new Date(comment.author.created_at),
          },
        })),
        hasMore: item.comments.has_more,
      }
    })
  );
}

function PostList() {
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    isFetching,
    isError,
  } = useInfiniteQuery<PostData[]>({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    initialPageParam: {
      beforeTimestamp: undefined,
      beforeId: undefined,
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length == 0) return undefined;

      return {
        beforeTimestamp: lastPage.at(-1)?.createdAt.toISOString(),
        beforeId: lastPage.at(-1)?.id,
      };
    }
  });

  const posts: ReactElement[] = [];

  if (data) {
    data.pages.forEach((page) => {
      posts.push(...page.map(
        (post) => (
          <Post
            key={post.id}
            id={post.id}
            title={post.title}
            content={post.content}
            createdAt={post.createdAt}
            authorId={post.author.id}
            authorDisplayName={post.author.displayName}
            authorUsername={post.author.username}
            authorCreatedAt={post.author.createdAt}
            comments={post.comments}
          />
        )
      ))
    });
  }

  React.useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['posts'] });
    }
  }, [queryClient]);

  return (
    <div>
      {posts}
      {
        isFetching &&
        <div
          className="text-center bg-mist-100 dark:bg-mist-800 rounded-xl p-1 not-first:mt-2"
        >Загрузка постов...</div>
      }
      {
        isError &&
        <div
          className="text-center bg-red-200 dark:bg-red-950 rounded-xl p-1 not-first:mt-2"
        >Ошибка загрузки постов</div>
      }
      <ScrollObserver handler={fetchNextPage} />
    </div>
  );
}

export default PostList;