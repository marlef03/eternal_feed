import { type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../util/apiClient';
import ScrollObserver from './ScrollObserver';
import Post from './Post';
import type { PostResponse, PostData } from '../interfaces/Post';

async function fetchPosts({ pageParam }) {
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
      authorId: item.author_id,
      createdAt: new Date(item.created_at),
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
          authorId={post.authorId}
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