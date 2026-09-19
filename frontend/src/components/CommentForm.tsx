import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { CommentCreate } from '../interfaces/Comment';
import apiClient from '../util/apiClient';
import { useAuthStatus } from '../util/authStatus';

async function createComment(postId: number, newCommentData: CommentCreate) {
  return await apiClient.post(`/posts/${postId}/comments`, newCommentData);
}

function CommentForm({
  postId,
}: {
  postId: number,
}) {
  const authed = useAuthStatus((state) => state.authed);

  const queryClient = useQueryClient();
  
  const {
    mutate,
    isPending,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: (data: CommentCreate) => createComment(postId, data),
    onSuccess: () => {
      queryClient.refetchQueries({queryKey: ['comments', postId]});
    },
  });

  const [ content, setContent ] = React.useState('');
  const [ formErrors, setFormErrors ] = React.useState({
    content: false,
  });

  if (!authed) {
    return (
      <div
        className="text-center bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-1 shadow-md mb-3 mt-3"
      >
        Войдите, чтобы написать комментарий
      </div>
    );
  }

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault()

    const newErrors = { ...formErrors };

    if (content.trim() == '') {
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
    setContent(event.target.value);
    setFormErrors((old) => ({...old, content: false}));
  }

  return (
    <div
      className="bg-mist-100 dark:bg-mist-800 rounded-2xl p-1 mb-2"
    >
      <div
        className="text-center p-2"
      >
        Написать комментарий
      </div>
      <form
        onSubmit={handleSubmit}
      >
        {
          formErrors.content && 
          <div
            className="text-center text-red-800 dark:text-red-300"
          >
            Обязательное поле
          </div>
        }
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
            ${
              formErrors.content ? 'bg-red-200 dark:bg-red-950' : ''
            }
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
        {
          isError &&
          <div
            className="text-center mt-2 p-1 rounded-xl bg-red-200 dark:bg-red-900"
          >
            Ошибка во время публикации комментария
          </div>
        }
        {
          isSuccess &&
          <div
            className="text-center mt-2 p-1 rounded-xl bg-emerald-200 dark:bg-emerald-900"
          >
            Комментарий успешно опубликован!
          </div>
        }
      </form>
    </div>
  );
}

export default CommentForm;