import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactElement, useEffect, useState } from "react";
import {
  type PostCountResponse,
  type PostData,
  type PostResponse,
  postResponseToData,
} from "../interfaces/Post";
import apiClient from "../util/apiClient";
import NewPostCount from "./NewPostCount";
import Post from "./Post";
import PostForm from "./PostForm";
import ScrollObserver from "./ScrollObserver";
import Transition from "./Transition";

async function fetchPosts({
  pageParam,
}: {
  pageParam: {
    beforeTimestamp?: string;
    beforeId?: number;
  };
}): Promise<PostData[]> {
  let data: PostResponse[];
  if (pageParam.beforeTimestamp) {
    data = (
      await apiClient.get(
        `/posts?before_timestamp=${pageParam.beforeTimestamp}&before_id=${pageParam.beforeId}`,
      )
    ).data;
  } else {
    data = (await apiClient.get("/posts")).data;
  }

  return data.map((item) => postResponseToData(item));
}

function PostList() {
  const queryClient = useQueryClient();

  const { data, fetchNextPage, isFetching, isError } = useInfiniteQuery({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    initialPageParam: {
      beforeTimestamp: undefined as string | undefined,
      beforeId: undefined as number | undefined,
    },
    getNextPageParam: (lastPage: PostData[]) => {
      if (lastPage.length === 0) return undefined;

      return {
        beforeTimestamp: lastPage.at(-1)?.createdAt.toISOString(),
        beforeId: lastPage.at(-1)?.id,
      };
    },
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRefreshError, setIsRefreshError] = useState(false);

  const [newPostCount, setNewPostCount] = useState(0);

  const [onTop, setOnTop] = useState(true);

  async function fetchNewPosts(afterTimestamp?: string, afterId?: number) {
    let data: PostResponse[];
    try {
      setIsRefreshing(true);
      if (afterTimestamp !== undefined && afterId !== undefined) {
        data = (
          await apiClient.get(
            `/posts?after_timestamp=${afterTimestamp}&after_id=${afterId}`,
          )
        ).data;
      } else {
        data = (await apiClient.get("/posts")).data;
      }
    } catch {
      setIsRefreshError(true);
      return;
    } finally {
      setIsRefreshing(false);
    }

    if (data) {
      queryClient.setQueryData(
        ["posts"],
        (old: {
          pages: PostData[][];
          pageParams: { beforeTimestamp?: string; beforeId?: number }[];
        }) => ({
          ...old,
          pages: old.pages.map((page, idx) =>
            idx === 0
              ? [...data.map((post) => postResponseToData(post)), ...page]
              : page,
          ),
        }),
      );
    }

    setNewPostCount(0);
  }

  async function fetchNewPostCount(afterTimestamp?: string, afterId?: number) {
    let data: PostCountResponse;
    try {
      if (afterTimestamp !== undefined && afterId !== undefined) {
        data = (
          await apiClient.get(
            `/posts/new-count?after_timestamp=${afterTimestamp}&after_id=${afterId}`,
          )
        ).data;
      } else {
        data = (await apiClient.get("/posts/new-count")).data;
      }
    } catch {
      return;
    }

    setNewPostCount(data.count);
  }

  async function fetchPostsByTimestamp() {
    if (data && data.pages[0].length > 0) {
      await fetchNewPosts(
        data.pages[0][0].createdAt.toISOString(),
        data.pages[0][0].id,
      );
    } else {
      await fetchNewPosts();
    }
  }

  useEffect(() => {
    const intId = setInterval(async () => {
      if (onTop) {
        fetchPostsByTimestamp();
      } else {
        if (data && data.pages[0].length > 0) {
          await fetchNewPostCount(
            data.pages[0][0].createdAt.toISOString(),
            data.pages[0][0].id,
          );
        } else {
          await fetchNewPostCount();
        }
      }
    }, 1000);

    return () => {
      clearInterval(intId);
    };
  }, [data, onTop]);

  const posts: ReactElement[] = [];

  if (data) {
    data.pages.forEach((page: PostData[]) => {
      posts.push(
        ...page.map((post) => (
          <Transition
            key={post.id}
            appear={true}
            onAppearStyle={{
              filter: "none",
              transitionProperty: "filter",
            }}
            onDisappearStyle={{
              filter: "brightness(0.3) invert(1)",
              transitionProperty: "filter",
            }}
            duration={300}
          >
            <Post
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
          </Transition>
        )),
      );
    });
  }

  return (
    <div>
      <PostForm fetchNewPosts={fetchPostsByTimestamp} />
      <ScrollObserver
        onEnter={() => setOnTop(true)}
        onExit={() => setOnTop(false)}
      />
      {posts}
      {(isFetching || isRefreshing) && (
        <div className="text-center bg-mist-100 dark:bg-mist-800 rounded-xl p-1 not-first:mt-2">
          Загрузка постов...
        </div>
      )}
      {(isError || isRefreshError) && (
        <div className="text-center bg-red-200 dark:bg-red-950 rounded-xl p-1 not-first:mt-2">
          Ошибка загрузки постов
        </div>
      )}
      {!isFetching && <ScrollObserver onEnter={fetchNextPage} />}
      <NewPostCount
        count={newPostCount}
        fetchNewPosts={fetchPostsByTimestamp}
      />
    </div>
  );
}

export default PostList;
