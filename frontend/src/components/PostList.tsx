import { type ReactElement } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import apiClient from '../util/apiClient';
import ScrollObserver from './ScrollObserver';
import Post from './Post';
import { type PostResponse, type PostData, postResponseToData } from '../interfaces/Post';

async function fetchPosts({ pageParam }): Promise<PostData[]> {
  let data: PostResponse[];
  if (pageParam.beforeTimestamp) {
    data = (await apiClient.get(`/posts?before_timestamp=${pageParam.beforeTimestamp}&before_id=${pageParam.beforeId}`)).data;
  } else {
    data = (await apiClient.get('/posts')).data;
  }

  return data.map((item) => postResponseToData(item));
}

function PostList() {
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
      {
        !isFetching &&
        <ScrollObserver handler={fetchNextPage} />
      }
    </div>
  );
}

export default PostList;