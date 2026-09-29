import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactElement, useEffect } from "react";
import {
  type PostData,
  type PostResponse,
  postCreateResponseToData,
  postResponseToData,
} from "../interfaces/Post";
import apiClient from "../util/apiClient";
import eventSourceStore from "../util/eventSourceStore";
import Post from "./Post";
import ScrollObserver from "./ScrollObserver";
import Transition from "./Transition";

async function fetchPosts({ pageParam }): Promise<PostData[]> {
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

  const { data, fetchNextPage, isFetching, isError } = useInfiniteQuery<
    PostData[]
  >({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    initialPageParam: {
      beforeTimestamp: undefined,
      beforeId: undefined,
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.length === 0) return undefined;

      return {
        beforeTimestamp: lastPage.at(-1)?.createdAt.toISOString(),
        beforeId: lastPage.at(-1)?.id,
      };
    },
  });

  useEffect(() => {
    if (eventSourceStore.get() == null) {
      eventSourceStore.connect();
    }

    eventSourceStore.get()?.addEventListener("post_created", (event) => {
      const newPost = postCreateResponseToData(JSON.parse(event.data));

      if (!eventSourceStore.seenPost(newPost.id)) {
        queryClient.setQueryData(
          ["posts"],
          (old: { pageParams: unknown[]; pages: PostData[][] }) => ({
            ...old,
            pages: old.pages.map((page, idx) =>
              idx === 0 ? [newPost, ...page] : page,
            ),
          }),
        );
      }
    });
  });

  const posts: ReactElement[] = [];

  if (data) {
    data.pages.forEach((page) => {
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
      {posts}
      {isFetching && (
        <div className="text-center bg-mist-100 dark:bg-mist-800 rounded-xl p-1 not-first:mt-2">
          Загрузка постов...
        </div>
      )}
      {isError && (
        <div className="text-center bg-red-200 dark:bg-red-950 rounded-xl p-1 not-first:mt-2">
          Ошибка загрузки постов
        </div>
      )}
      {!isFetching && <ScrollObserver handler={fetchNextPage} />}
    </div>
  );
}

export default PostList;
