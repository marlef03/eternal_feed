import React from 'react';
import { useQuery } from '@tanstack/react-query';
import type { UserData, UserResponse } from '../interfaces/User';
import apiClient from '../util/apiClient';
import { useAuthStatus } from '../util/authStatus';
import LoginForm from './LoginForm';

async function getUser(): Promise<UserData> {
  const data: UserResponse = (await apiClient.get(`/users/me`)).data;

  return {
    id: data.id,
    displayName: data.display_name,
    username: data.username,
    email: data.email,
    createdAt: new Date(data.created_at),
  };
}

function Profile() {
  const authed = useAuthStatus((state) => state.authed);

  const [ open, setOpen ] = React.useState(false);

  const {
    data,
    isLoading,
  } = useQuery<UserData>({
    queryKey: ['user'],
    queryFn: getUser,
    retry: false,
  });

  return (
    <div
      className="flex flex-col items-end"
    >
      <button
        onClick={() => setOpen(!open)}
        className="cursor-pointer bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-2 m-1 shadow-md"
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
              'Войти'
          )
        }
      </button>
      {
        !isLoading && open && (
          authed ?
            <div
              className="w-36 float-right bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-2 m-1 shadow-md"
            >
              <div
                className="block text-center p-1 pt-0 bg-mist-200 dark:bg-mist-700 rounded-xl mb-2"
              >
                {`${data?.displayName} (@${data?.username})`}
              </div>
              <div
                className="block text-center p-1 pt-0 bg-mist-200 dark:bg-mist-700 rounded-xl mb-2"
              >
                {data?.email}
              </div>
            </div>
          :
            <LoginForm />
        )
      }
    </div>
  );
}

export default Profile;