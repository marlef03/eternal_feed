import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import {
  type CommentCreate,
  type CommentResponse,
  type CommentsData,
  commentCreateResponseToData,
} from "../interfaces/Comment";
import type { UserData } from "../interfaces/User";
import apiClient from "../util/apiClient";
import { useAuthStatus } from "../util/authStatus";

async function createComment(
  postId: number,
  newCommentData: CommentCreate,
): Promise<CommentResponse> {
  return (await apiClient.post(`/posts/${postId}/comments`, newCommentData))
    .data;
}

function CommentForm({ postId }: { postId: number }) {
  const authed = useAuthStatus((state) => state.authed);

  const queryClient = useQueryClient();

  const { mutate, isPending, isError, isSuccess } = useMutation({
    mutationFn: (data: CommentCreate) => createComment(postId, data),
    onSuccess: (newCommentResponse: CommentResponse) => {
      const authorData: UserData | undefined = queryClient.getQueryData([
        "user",
      ]);

      if (!authorData) {
        return; // TODO: change to refetch
      }

      const newComment = commentCreateResponseToData(
        newCommentResponse,
        authorData,
      );

      queryClient.setQueryData(
        ["comments", postId],
        (old: { pageParams: unknown[]; pages: CommentsData[] }) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page, idx) =>
              idx === 0
                ? { ...page, items: [newComment, ...page.items] }
                : page,
            ),
          };
        },
      );
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
    setFormErrors((old) => ({ ...old, content: false }));
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
        {isError && (
          <div className="text-center mt-2 p-1 rounded-xl bg-red-200 dark:bg-red-900">
            Ошибка во время публикации комментария
          </div>
        )}
        {isSuccess && (
          <div className="text-center mt-2 p-1 rounded-xl bg-emerald-200 dark:bg-emerald-900">
            Комментарий успешно опубликован!
          </div>
        )}
      </form>
    </div>
  );
}

export default CommentForm;
