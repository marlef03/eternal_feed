import {
  type QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import React, { useState } from "react";
import type { CommentCreate, CommentResponse } from "../interfaces/Comment";
import apiClient from "../util/apiClient";
import { useAuthStatus } from "../util/authStatus";
import Transition from "./Transition";

async function createComment(
  postId: number,
  newCommentData: CommentCreate,
): Promise<CommentResponse> {
  return (await apiClient.post(`/posts/${postId}/comments`, newCommentData))
    .data;
}

function CommentForm({
  postId,
  fetchCommentsAfter,
}: {
  postId: number;
  fetchCommentsAfter: (
    queryClient: QueryClient,
    postId: number,
  ) => Promise<void>;
}) {
  const authed = useAuthStatus((state) => state.authed);

  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CommentCreate) => createComment(postId, data),
    onSuccess: () => {
      fetchCommentsAfter(queryClient, postId);

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 2000);
    },
    onError: () => {
      setIsError(true);
      setTimeout(() => setIsError(false), 2000);
    },
  });

  const [content, setContent] = React.useState("");
  const [formErrors, setFormErrors] = React.useState({
    content: false,
  });

  if (!authed) {
    return (
      <div className="text-center bg-mist-100 dark:bg-mist-800 rounded-xl p-1 mb-3">
        Войдите, чтобы написать комментарий
      </div>
    );
  }

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    const newErrors = { ...formErrors };

    if (content.trim() === "") {
      newErrors.content = true;
    }

    setFormErrors(newErrors);

    for (const error of Object.values(newErrors)) {
      if (error) return;
    }

    mutate({
      content,
    });
  }

  function handleContentChange(event: React.ChangeEvent) {
    setContent((event.target as HTMLTextAreaElement).value);
    setFormErrors((old: { content: boolean }) => ({ ...old, content: false }));
  }

  return (
    <div className="bg-mist-100 dark:bg-mist-800 rounded-2xl p-1 mb-2">
      <div className="text-center p-2">Написать комментарий</div>
      <form onSubmit={handleSubmit}>
        {formErrors.content && (
          <div className="text-center text-red-800 dark:text-red-300">
            Обязательное поле
          </div>
        )}
        <textarea
          onChange={handleContentChange}
          value={content}
          className={`
            block
            w-full
            bg-mist-200
            dark:bg-mist-700
            rounded-xl
            p-1
            resize-none
            field-sizing-content
            ${formErrors.content ? "bg-red-200 dark:bg-red-950" : ""}
          `}
        />
        <button
          type="submit"
          disabled={isPending}
          className="
            w-full
            text-center
            mt-2 p-1
            rounded-xl
            bg-mist-200
            dark:bg-mist-700
            hover:cursor-pointer
            hover:bg-mist-50
            hover:dark:bg-mist-900
            transition-colors
          "
        >
          Опубликовать
        </button>
        <Transition
          appear={isError}
          onAppearStyle={{
            opacity: 1,
            height: "60px",
            transitionProperty: "height opacity",
          }}
          onDisappearStyle={{
            opacity: 0,
            height: "0px",
            transitionProperty: "height opacity",
          }}
          duration={200}
          className="flex items-center overflow-hidden"
        >
          <div className="w-full text-center mt-2 p-1 rounded-xl bg-red-200 dark:bg-red-900">
            Ошибка во время публикации комментария
          </div>
        </Transition>
        <Transition
          appear={isSuccess}
          onAppearStyle={{
            opacity: 1,
            height: "60px",
            transitionProperty: "height opacity",
          }}
          onDisappearStyle={{
            opacity: 0,
            height: "0px",
            transitionProperty: "height opacity",
          }}
          duration={200}
          className="flex items-center overflow-hidden"
        >
          <div className="w-full text-center mt-2 p-1 rounded-xl bg-emerald-200 dark:bg-emerald-900">
            Комментарий успешно опубликован!
          </div>
        </Transition>
      </form>
    </div>
  );
}

export default CommentForm;
