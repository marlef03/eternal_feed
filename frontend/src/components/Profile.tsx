import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { userResponseToData, type UserData, type UserResponse } from '../interfaces/User';
import apiClient from '../util/apiClient';
import { useAuthStatus } from '../util/authStatus';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';

async function getUser(): Promise<UserData> {
  const data: UserResponse = (await apiClient.get(`/users/me`)).data;

  return userResponseToData(data);
}

function Profile() {
  const authed = useAuthStatus((state) => state.authed);

  const [ open, setOpen ] = React.useState(false);
  const [ isLoginPage, setIsLoginPage ] = React.useState(true);

  const {
    data,
    isLoading,
  } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: getUser,
    retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error?.response?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
  });

  return (
    <div
      className="w-[calc(100%-0.5rem)] max-w-md m-1 fixed right-0 top-0 flex flex-col items-end"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-32 cursor-pointer bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-2 mb-1 shadow-md"
      >
        {
          isLoading &&
          <div>
            Загрузка...
          </div>
        }
        {
          !isLoading && (
            authed ? 
              data?.displayName
            :
              !open ?
                'Войти'
              :
                isLoginPage ?
                  'Вход'
                :
                  'Регистрация'
          )
        }
      </button>
      {
        !isLoading && open && (
          authed ?
            <div
              className="w-full bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-2 shadow-md"
            >
              <div
                className="block text-center p-1 pt-0 bg-mist-200 dark:bg-mist-700 rounded-xl mb-2"
              >
                {`${data?.displayName} (@${data?.username})`}
              </div>
              <div
                className="block text-center p-1 pt-0 bg-mist-200 dark:bg-mist-700 rounded-xl"
              >
                {data?.email}
              </div>
            </div>
          :
            isLoginPage ? 
              <LoginForm 
                close={() => setOpen(false)}
                goToSignUp={() => setIsLoginPage(false)}
              />
            :
              <SignUpForm
                close={() => setOpen(false)}
                goToLogin={() => setIsLoginPage(true)}
              />
        )
      }
    </div>
  );
}

export default Profile;