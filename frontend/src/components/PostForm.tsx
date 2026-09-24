import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PostCreate, PostData, PostCreateResponse } from '../interfaces/Post';
import { postCreateResponseToData } from '../interfaces/Post';
import apiClient from '../util/apiClient';
import { useAuthStatus } from '../util/authStatus';
import type { UserData } from '../interfaces/User';

async function createPost(newPostData: PostCreate) {
  return (await apiClient.post('/posts', newPostData)).data;
}

function PostForm() {
  const authed = useAuthStatus((state) => state.authed);

  const queryClient = useQueryClient();

  const {
    mutate,
    isPending,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: createPost,
    onSuccess: (newPostResponse: PostCreateResponse) => {
      const authorData: UserData | undefined = queryClient.getQueryData(['user']);

      if (!authorData) {
        return; // TODO: change to refetch
      }

      const newPost = postCreateResponseToData(newPostResponse, authorData);

      queryClient.setQueryData(['posts'], (old: { pageParams: unknown[], pages: PostData[][] }) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page, idx) => idx == 0 ? [newPost, ...page] : page),
        };
      });
    },
  });

  const [ title, setTitle ] = React.useState('');
  const [ content, setContent ] = React.useState('');
  const [ formErrors, setFormErrors ] = React.useState({
    title: false,
    content: false,
  });

  if (!authed) {
    return (
      <div
        className="text-center bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-1 shadow-md mb-3 mt-3"
      >
        Войдите, чтобы написать пост
      </div>
    );
  }

  function preventFromSubmitting(event: React.KeyboardEvent) {
    if (event.key == 'Enter' && (event.target as Element).tagName !== 'TEXTAREA') {
      event.preventDefault()
    }
  }

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault()

    const newErrors = { ...formErrors };

    if (title.trim() == '') {
      newErrors.title = true;
    }

    if (content.trim() == '') {
      newErrors.content = true;
    }

    setFormErrors(newErrors);

    for (const error of Object.values(newErrors)) {
      if (error) return;
    }
    
    mutate({
      title,
      content,
    });
  }

  function handleTitleChange(event: React.ChangeEvent) {
    setTitle((event.target as HTMLInputElement).value);
    setFormErrors((old) => ({...old, title: false}));
  }

  function handleContentChange(event: React.ChangeEvent) {
    setContent((event.target as HTMLTextAreaElement).value);
    setFormErrors((old) => ({...old, content: false}));
  }

  return (
    <div
      className="bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-1 shadow-md mb-3 mt-3"
    >
      <div
        className="text-center text-xl p-2"
      >
        Написать пост
      </div>
      <form
        onKeyDown={preventFromSubmitting}
        onSubmit={handleSubmit}
      >
        <label
          className="block text-center p-1 pt-0 bg-mist-200 dark:bg-mist-700 rounded-xl mb-2"
        >
          <div
            className="p-2"
          >
            Заголовок поста
          </div>
          {
            formErrors.title && 
            <div
              className="text-red-800 dark:text-red-300"
            >
              Обязательное поле
            </div>
          }
          <input
            type="text"
            onChange={handleTitleChange}
            value={title}
            className={`
              block
              w-full 
              bg-mist-100 
              dark:bg-mist-800 
              rounded-xl 
              p-1 
              text-xl
              ${
                formErrors.title ? 'bg-red-200 dark:bg-red-950' : ''
              }
            `}
          />
        </label>
        <label
          className="block text-center p-1 pt-0 bg-mist-200 dark:bg-mist-700 rounded-xl"
        >
          <div
            className="p-2"
          >
            Текст поста
          </div>
          {
            formErrors.content && 
            <div
              className="text-red-800 dark:text-red-300"
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
              bg-mist-100 
              dark:bg-mist-800 
              rounded-xl 
              p-1 
              resize-none 
              field-sizing-content
              ${
                formErrors.content ? 'bg-red-200 dark:bg-red-950' : ''
              }
            `}
          />
        </label>
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
            Ошибка во время публикации поста
          </div>
        }
        {
          isSuccess &&
          <div
            className="text-center mt-2 p-1 rounded-xl bg-emerald-200 dark:bg-emerald-900"
          >
            Пост успешно опубликован!
          </div>
        }
      </form>
    </div>
  );
}

export default PostForm;