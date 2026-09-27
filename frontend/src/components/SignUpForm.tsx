import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../util/apiClient';
import type { SignUpData, SignUpFormErrors } from '../interfaces/Auth';
import { doesIncludeDigits, doesIncludeLowercaseLetter, doesIncludeProhibitedChars, doesIncludeUppercaseLetter, isValidEmail, isValidUsername } from '../util/helperFunctions';
import axios from 'axios';
import { userResponseToData, type NewUserResponse } from '../interfaces/User';
import tokenStore from '../util/tokenStore';
import { useAuthStatus } from '../util/authStatus';

async function signUp(newUserData: SignUpData): Promise<NewUserResponse> {
  return (await apiClient.post('/users', newUserData)).data;
}

function SignUpForm({
  goToLogin,
}: { goToLogin: () => void }) {
  const queryClient = useQueryClient();

  const {
    data,
    mutate,
    isPending,
    isError,
    error,
    isSuccess,
  } = useMutation({
    mutationFn: signUp,
    retry(failureCount, error) {
      if (axios.isAxiosError(error) && error.response?.status == 409) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const login = useAuthStatus((state) => state.login)

  const [ displayName, setDisplayName ] = React.useState('');
  const [ username, setUsername ] = React.useState('');
  const [ email, setEmail ] = React.useState('');
  const [ password, setPassword ] = React.useState('');
  const [ passwordAgain, setPasswordAgain ] = React.useState('');
  const [ formErrors, setFormErrors ] = React.useState<SignUpFormErrors>({
    displayName: null,
    username: null,
    email: null,
    password: null,
    passwordAgain: null,
  });

  const usernameTimeoutId = React.useRef<number>(undefined);
  const emailTimeoutId = React.useRef<number>(undefined);

  React.useEffect(() => {
    return () => {
      queryClient.removeQueries({ queryKey: ['user_login'] });
    }
  }, [queryClient]);

  if (isSuccess) {
    const userData = userResponseToData(data.user_data);
    const accessToken = data.token.access_token;

    tokenStore.set(accessToken);

    login();

    queryClient.setQueryData(['user'], userData);
  }

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    const newErrors = { ...formErrors };

    if (displayName.trim() == '') {
      newErrors.displayName = 'Обязательное поле';
    }

    if (displayName.length > 50) {
      newErrors.displayName = 'Длина имени не должна превышать 50 символов';
    }

    if (username.trim() == '') {
      newErrors.username = 'Обязательное поле';
    }

    if (!isValidUsername(username)) {
      newErrors.username = 'Имя пользователя может содержать лишь буквы латинского алфавита, цифры, знак подчеркивания _ и дефис -';
    }

    if (username.length > 50) {
      newErrors.username = 'Длина имени пользователя не должна превышать 50 символов';
    }

    if (!newErrors.username) {
      try {
        await apiClient.get('/users/exists', {params: {username: username}});
      } catch {
        newErrors.username = 'Имя пользователя занято, укажите другое';
      }
    }

    if (email == '') {
      newErrors.email = 'Обязательное поле';
    }

    if (!isValidEmail(email)) {
      newErrors.email = 'Некорректный адрес электронной почты';
    }

    if (email.length > 255) {
      newErrors.email = 'Длина адреса электронной почты не должна превышать 255 символов';
    }

    if (!newErrors.email) {
      try {
        await apiClient.get('/users/exists', {params: {email: email}});
      } catch {
        newErrors.email = 'Аккаунт с таким адресом электронной почты уже зарегистрирован';
      }
    }

    if (password == '') {
      newErrors.password = 'Обязательное поле';
    }

    if (!doesIncludeDigits(password)) {
      newErrors.password = 'Пароль должен содержать хотя бы одну цифру';
    }

    if (!doesIncludeLowercaseLetter(password)) {
      newErrors.password = 'Пароль должен содержать хотя бы одну строчную букву латинского алфавита';
    }

    if (!doesIncludeUppercaseLetter(password)) {
      newErrors.password = 'Пароль должен содержать хотя бы одну прописную букву латинского алфавита';
    }

    if (doesIncludeProhibitedChars(password)) {
      newErrors.password = 'Пароль должен содержать только строчные и прописные буквы латинского алфавита и цифры';
    }

    if (password.length < 8) {
      newErrors.password = 'Длина пароля должна быть не меньше 8 символов';
    }

    if (password.length > 100) {
      newErrors.password = 'Длина пароля не должна превышать 100 символов';
    }

    if (passwordAgain.trim() == '') {
      newErrors.passwordAgain = 'Обязательное поле';
    }

    if (password != passwordAgain && passwordAgain.trim() != '') {
      newErrors.passwordAgain = 'Пароли не совпадают';
    }

    setFormErrors(newErrors);

    for (const error of Object.values(newErrors)) {
      if (error) return;
    }

    mutate({
      display_name: displayName,
      username,
      email,
      password,
    });
  }

  function handleDisplayNameChange(event: React.ChangeEvent) {
    setDisplayName((event.target as HTMLInputElement).value);

    let error = null;

    if ((event.target as HTMLInputElement).value.length > 50) {
      error = 'Длина имени не должна превышать 50 символов';
    }

    setFormErrors((old) => ({...old, displayName: error}));
  }

  function handleUsernameChange(event: React.ChangeEvent) {
    setUsername((event.target as HTMLInputElement).value);

    let error = null;

    if ((event.target as HTMLInputElement).value.length > 0) {
      if (!isValidUsername((event.target as HTMLInputElement).value)) {
        error = 'Имя пользователя может содержать лишь буквы латинского алфавита, цифры, знак подчеркивания _ и дефис -';
      }

      if ((event.target as HTMLInputElement).value.length > 50) {
        error = 'Длина имени пользователя не должна превышать 50 символов';
      }

      if (!error) {
        clearTimeout(usernameTimeoutId.current);
        usernameTimeoutId.current = setTimeout(async () => {
          try {
            await apiClient.get('/users/exists', {params: {username: (event.target as HTMLInputElement).value}});
          } catch {
            setFormErrors((old) => ({...old, username: 'Имя пользователя занято, укажите другое'}));
          }
        }, 500);
      }
    }

    setFormErrors((old) => ({...old, username: error}));
  }

  function handleEmailChange(event: React.ChangeEvent) {
    setEmail((event.target as HTMLInputElement).value);

    let error = null;

    if ((event.target as HTMLInputElement).value.length > 0) {
      if ((event.target as HTMLInputElement).value.length > 255) {
        error = 'Длина адреса электронной почты не должна превышать 255 символов';
      }

      if (!error) {
        clearTimeout(emailTimeoutId.current);
        emailTimeoutId.current = setTimeout(async () => {
          try {
            await apiClient.get('/users/exists', {params: {email: (event.target as HTMLInputElement).value}});
          } catch {
            setFormErrors((old) => ({...old, email: 'Аккаунт с таким адресом электронной почты уже зарегистрирован'}));
          }
        }, 500);
      }
    }

    setFormErrors((old) => ({...old, email: error}));
  }

  function handlePasswordChange(event: React.ChangeEvent) {
    setPassword((event.target as HTMLInputElement).value);

    let error = null;

    if ((event.target as HTMLInputElement).value.length > 0) {
      if (!doesIncludeDigits((event.target as HTMLInputElement).value)) {
        error = 'Пароль должен содержать хотя бы одну цифру';
      }

      if (!doesIncludeLowercaseLetter((event.target as HTMLInputElement).value)) {
        error = 'Пароль должен содержать хотя бы одну строчную букву латинского алфавита';
      }

      if (!doesIncludeUppercaseLetter((event.target as HTMLInputElement).value)) {
        error = 'Пароль должен содержать хотя бы одну прописную букву латинского алфавита';
      }

      if (doesIncludeProhibitedChars((event.target as HTMLInputElement).value)) {
        error = 'Пароль должен содержать только строчные и прописные буквы латинского алфавита и цифры';
      }

      if ((event.target as HTMLInputElement).value.length < 8) {
        error = 'Длина пароля должна быть не меньше 8 символов';
      }

      if ((event.target as HTMLInputElement).value.length > 100) {
        error = 'Длина пароля не должна превышать 100 символов';
      }
    }

    setFormErrors((old) => ({...old, password: error}));
  }

  function handlePasswordAgainChange(event: React.ChangeEvent) {
    setPasswordAgain((event.target as HTMLInputElement).value);

    let error = null;

    if ((password != (event.target as HTMLInputElement).value) && (event.target as HTMLInputElement).value.length > 0) {
      error = 'Пароли не совпадают';
    }

    setFormErrors((old) => ({...old, passwordAgain: error}));
  }

  return (
    <div
      className={`
        w-full
        max-h-[80vh]
        overflow-y-auto
        scheme-light-dark
        bg-mist-100
        dark:bg-mist-800
        border
        border-mist-400
        dark:border-mist-600
        rounded-2xl
        p-2
        shadow-md
      `}
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
            Имя
          </div>
          {
            formErrors.displayName && 
            <div
              className="text-red-800 dark:text-red-300"
            >
              {formErrors.displayName}
            </div>
          }
          <input
            type="text"
            onChange={handleDisplayNameChange}
            value={displayName}
            className={`
              block
              w-full 
              bg-mist-100 
              dark:bg-mist-800 
              rounded-xl 
              p-1 
              text-xl
              ${
                formErrors.displayName ? 'bg-red-200 dark:bg-red-950' : ''
              }
            `}
          />
        </label>
        <label
          className="block text-center p-1 pt-0 bg-mist-200 dark:bg-mist-700 rounded-xl mb-2"
        >
          <div
            className="pt-2"
          >
            Имя пользователя
          </div>
          <div
            className="text-sm pb-2 text-mist-600 dark:text-mist-400"
          >
            может содержать только буквы латинского алфавита, цифры, знак нижнего подчеркивания _ и дефис -
          </div>
          {
            formErrors.username && 
            <div
              className="text-red-800 dark:text-red-300"
            >
              {formErrors.username}
            </div>
          }
          <input
            type="text"
            onChange={handleUsernameChange}
            value={username}
            className={`
              block
              w-full 
              bg-mist-100 
              dark:bg-mist-800 
              rounded-xl 
              p-1 
              text-xl
              ${
                formErrors.username ? 'bg-red-200 dark:bg-red-950' : ''
              }
            `}
          />
        </label>
        <label
          className="block text-center p-1 pt-0 bg-mist-200 dark:bg-mist-700 rounded-xl mb-2"
        >
          <div
            className="p-2"
          >
            Адрес электронной почты
          </div>
          {
            formErrors.email && 
            <div
              className="text-red-800 dark:text-red-300"
            >
              {formErrors.email}
            </div>
          }
          <input
            type="email"
            onChange={handleEmailChange}
            value={email}
            className={`
              block
              w-full 
              bg-mist-100 
              dark:bg-mist-800 
              rounded-xl 
              p-1 
              text-xl
              ${
                formErrors.email ? 'bg-red-200 dark:bg-red-950' : ''
              }
            `}
          />
        </label>
        <label
          className="block text-center p-1 pt-0 bg-mist-200 dark:bg-mist-700 rounded-xl mb-2"
        >
          <div
            className="pt-2"
          >
            Пароль
          </div>
          <div
            className="text-sm pb-2 text-mist-600 dark:text-mist-400"
          >
            длина не менее 8 символов, должен содержать хотя бы одну букву латинского алфавита верхнего и нижнего регистра и хотя бы одну цифру
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
        <label
          className="block text-center p-1 pt-0 bg-mist-200 dark:bg-mist-700 rounded-xl"
        >
          <div
            className="p-2"
          >
            Повторите пароль
          </div>
          {
            formErrors.passwordAgain && 
            <div
              className="text-red-800 dark:text-red-300"
            >
              {formErrors.passwordAgain}
            </div>
          }
          <input
            type="password"
            onChange={handlePasswordAgainChange}
            value={passwordAgain}
            className={`
              block 
              w-full 
              bg-mist-100 
              dark:bg-mist-800 
              rounded-xl 
              p-1 
              ${
                formErrors.passwordAgain ? 'bg-red-200 dark:bg-red-950' : ''
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
          Зарегистрироваться
        </button>
        {
          isPending &&
          <div
            className="text-center mt-2 p-1 rounded-xl bg-mist-200 dark:bg-mist-700"
          >
            Регистрация...
          </div>
        }
        {
          isError &&
          <div
            className="text-center mt-2 p-1 rounded-xl bg-red-200 dark:bg-red-900"
          >
            {
              axios.isAxiosError(error) && error.response?.status == 409 ?
                error.response.data.detail == 'email' ? 
                  'Пользователь с таким адресом электронной почты уже существует, попробуйте войти'
                :
                  'Пользователь с таким именем пользователя уже существует, выберите другой'
              :
                'Произошла ошибка во время регистрации, попробуйте снова'
            }
          </div>
        }
      </form>
      <button
        onClick={goToLogin}
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
        Уже есть аккаунт
      </button>
    </div>
  );
}

export default SignUpForm;