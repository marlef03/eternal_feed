import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../util/apiClient';
import type { UsernameLoginData, EmailLoginData, TokenData, LoginParams, LoginFormErrors } from '../interfaces/Auth';
import tokenStore from '../util/tokenStore';
import { isValidEmail } from '../util/helperFunctions';
import useOutsideClick from '../hooks/useOutsideClick';

async function loginViaUsername(loginData: UsernameLoginData): Promise<TokenData> {
  return (await apiClient.post('/auth/login/username', loginData)).data;
}

async function loginViaEmail(loginData: EmailLoginData): Promise<TokenData> {
  return (await apiClient.post('/auth/login/email', loginData)).data;
}

async function login({ loginData, type }: LoginParams) {
  let token: string | null = null;

  if (type == 'username') {
    token = (await loginViaUsername(loginData as UsernameLoginData)).access_token;
  }
  if (type == 'email') {
    token = (await loginViaEmail(loginData as EmailLoginData)).access_token;
  }

  if (token !== null) {
    tokenStore.set(token);
  }
}

function LoginForm({
  goToSignUp,
  close,
}: { goToSignUp: () => void, close: () => void }) {
  const queryClient = useQueryClient();

  const {
    mutate,
    isPending,
    isError,
    isSuccess,
  } = useMutation({
    mutationFn: login,
  });

  const [ userLogin, setUserLogin ] = React.useState('');
  const [ password, setPassword ] = React.useState('');
  const [ formErrors, setFormErrors ] = React.useState<LoginFormErrors>({
    userLogin: null,
    password: null,
  });

  const formRef = React.useRef<HTMLDivElement>(null);
  
  useOutsideClick(formRef, close);

  function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    const newErrors = { ...formErrors };

    if (userLogin.trim() == '') {
      newErrors.userLogin = 'Обязательное поле';
    }

    if (userLogin.includes('@')) {
      if (!isValidEmail(userLogin)) {
        newErrors.userLogin = 'Некорректный адрес электронной почты';
      }

      if (userLogin.length > 255) {
        newErrors.userLogin = 'Длина адреса электронной почты не должна превышать 255 символов';
      }
    }

    if (!userLogin.includes('@') && userLogin.length > 50) {
      newErrors.userLogin = 'Длина имени пользователя не должна превышать 50 символов';
    }

    if (password.trim() == '') {
      newErrors.password = 'Обязательное поле';
    }

    if (password.length > 100) {
      newErrors.password = 'Длина пароля не должна превышать 100 символов';
    }

    setFormErrors(newErrors);

    for (const error of Object.values(newErrors)) {
      if (error) return;
    }

    if (userLogin.includes('@')) {
      mutate({
        loginData: {
          email: userLogin,
          password,
        },
        type: 'email',
      });
    } else {
      mutate({
        loginData: {
          username: userLogin,
          password,
        },
        type: 'username',
      });
    }
  }

  function handleUserLoginChange(event: React.ChangeEvent) {
    setUserLogin((event.target as HTMLInputElement).value);

    const error = (event.target as HTMLInputElement).value.includes('@') && !isValidEmail((event.target as HTMLInputElement).value) ? 'Некорректный адрес электронной почты' : null;
    setFormErrors((old) => ({...old, userLogin: error}));
  }

  function handlePasswordChange(event: React.ChangeEvent) {
    setPassword((event.target as HTMLInputElement).value);
    setFormErrors((old) => ({...old, password: null}));
  }

  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ['user'] });
  }

  React.useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['user_login'] });
    }
  }, [queryClient]);

  return (
    <div
      ref={formRef}
      className="w-full bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-2 shadow-md"
    >
      <form
        onSubmit={handleSubmit}
      >
        <label
          className="block text-center p-1 pt-0 bg-mist-200 dark:bg-mist-700 rounded-xl mb-2"
        >
          <div
            className="p-2"
          >
            Имя пользователя или адрес электронной почты
          </div>
          {
            formErrors.userLogin && 
            <div
              className="text-red-800 dark:text-red-300"
            >
              {formErrors.userLogin}
            </div>
          }
          <input
            type="text"
            onChange={handleUserLoginChange}
            value={userLogin}
            className={`
              block
              w-full 
              bg-mist-100 
              dark:bg-mist-800 
              rounded-xl 
              p-1 
              text-xl
              ${
                formErrors.userLogin ? 'bg-red-200 dark:bg-red-950' : ''
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
            Пароль
          </div>
          {
            formErrors.password && 
            <div
              className="text-red-800 dark:text-red-300"
            >
              {formErrors.password}
            </div>
          }
          <input
            type="password"
            onChange={handlePasswordChange}
            value={password}
            className={`
              block 
              w-full 
              bg-mist-100 
              dark:bg-mist-800 
              rounded-xl 
              p-1 
              ${
                formErrors.password ? 'bg-red-200 dark:bg-red-950' : ''
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
          Войти
        </button>
        {
          isPending &&
          <div
            className="text-center mt-2 p-1 rounded-xl bg-mist-200 dark:bg-mist-700"
          >
            Вход...
          </div>
        }
        {
          isError &&
          <div
            className="text-center mt-2 p-1 rounded-xl bg-red-200 dark:bg-red-900"
          >
            Неверное имя пользователя или пароль
          </div>
        }
      </form>
      <button
        onClick={goToSignUp}
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
        Еще нет аккаунта
      </button>
    </div>
  );
}

export default LoginForm;