import { type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
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
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
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

  if (status == 'pending') {
    return <div>Загрузка...</div>
  }

  if (status == 'error') {
    return <div>Ошибка загрузки</div>
  }

  const posts: ReactElement[] = [];

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

  return (
    <div>
      {posts}
      {
        isFetchingNextPage && <div>Загрузка...</div>
      }
      <ScrollObserver handler={!isFetchingNextPage && hasNextPage ? fetchNextPage : undefined} />
    </div>
  );
}

export default PostList;