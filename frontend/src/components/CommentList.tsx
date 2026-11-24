import {
  type QueryClient,
  type QueryFunctionContext,
  useInfiniteQuery,
} from "@tanstack/react-query";
import type { ReactElement } from "react";
import {
  type CommentsData,
  type CommentsResponse,
  commentsResponseToData,
} from "../interfaces/Comment";
import type { CommentListProps } from "../interfaces/CommentListProps";
import apiClient from "../util/apiClient";
import Comment from "./Comment";
import CommentForm from "./CommentForm";
import Transition from "./Transition";

async function fetchComments({
  pageParam,
  queryKey,
}: QueryFunctionContext<
  readonly (string | number)[],
  {
    beforeTimestamp: string | undefined;
    beforeId: number | undefined;
  }
>): Promise<CommentsData> {
  let data: CommentsResponse;
  if (pageParam.beforeTimestamp) {
    data = (
      await apiClient.get(
        `/posts/${queryKey[1]}/comments?before_timestamp=${pageParam.beforeTimestamp}&before_id=${pageParam.beforeId}`,
      )
    ).data;
  } else {
    data = (await apiClient.get(`/posts/${queryKey[1]}/comments`)).data;
  }

  return commentsResponseToData(data);
}

async function fetchCommentsAfter(queryClient: QueryClient, postId: number) {
  const queryData = queryClient.getQueryData<{
    pages: CommentsData[];
  }>(["comments", postId]);

  if (
    !queryData ||
    queryData.pages.length === 0 ||
    queryData.pages[0].items.length === 0
  )
    return;

  const timestamp = queryData.pages[0].items[0].createdAt.toISOString();
  const id = queryData.pages[0].items[0].id;

  const data: CommentsResponse = (
    await apiClient.get(
      `/posts/${postId}/comments?after_timestamp=${timestamp}&after_id=${id}`,
    )
  ).data;

  if (data.items.length === 0) return;

  queryClient.setQueryData(
    ["comments", postId],
    (old: {
      pageParams: {
        beforeTimestamp: string | undefined;
        beforeId: number | undefined;
      }[];
      pages: CommentsData[];
    }) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page, idx) =>
          idx === 0
            ? {
                ...page,
                items: [...commentsResponseToData(data).items, ...page.items],
              }
            : page,
        ),
      };
    },
  );
}

function CommentList({ postId, preloadedComments }: CommentListProps) {
  const { data, fetchNextPage, hasNextPage, isFetching, isFetched, status } =
    useInfiniteQuery({
      queryKey: ["comments", postId],
      queryFn: fetchComments,
      initialPageParam: {
        beforeTimestamp: undefined as string | undefined,
        beforeId: undefined as number | undefined,
      },
      initialData: {
        pageParams: [
          {
            beforeTimestamp: undefined as string | undefined,
            beforeId: undefined as number | undefined,
          },
        ],
        pages: [preloadedComments],
      },
      staleTime: Infinity,
      getNextPageParam: (lastPage: CommentsData) => {
        if (!lastPage.hasMore) return undefined;

        return {
          beforeTimestamp: lastPage.items.at(-1)?.createdAt.toISOString(),
          beforeId: lastPage.items.at(-1)?.id,
        };
      },
    });

  const comments: ReactElement[] = [];

  if (data) {
    data.pages.forEach((page: CommentsData) => {
      comments.push(
        ...page.items.map((comment) => (
          <Transition
            key={comment.id}
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
            className="not-first:mt-2"
          >
            <Comment
              id={comment.id}
              content={comment.content}
              createdAt={comment.createdAt}
              authorId={comment.author.id}
              authorDisplayName={comment.author.displayName}
              authorUsername={comment.author.username}
              authorCreatedAt={comment.author.createdAt}
            />
          </Transition>
        )),
      );
    });
  }

  return (
    <div>
      <CommentForm postId={postId} fetchCommentsAfter={fetchCommentsAfter} />
      {data.pages[0].items.length === 0 && (
        <div
          className="
            text-center
            p-1
            rounded-xl
            bg-mist-100
            dark:bg-mist-800
          "
        >
          Без комментариев
        </div>
      )}
      <div>{comments}</div>
      {isFetching && (
        <div className="text-center bg-mist-100 dark:bg-mist-800 rounded-xl p-1 not-first:mt-2">
          Загрузка комментариев...
        </div>
      )}
      {status === "error" && (
        <div className="text-center bg-mist-100 dark:bg-mist-800 rounded-xl p-1 not-first:mt-2">
          Ошибка загрузки комментариев
        </div>
      )}
      {(status === "error" ||
        (!isFetched && preloadedComments.hasMore) ||
        (hasNextPage && !isFetching)) && (
        <button
          type="button"
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
      )}
    </div>
  );
}

export default CommentList;
