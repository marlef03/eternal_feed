import React from 'react';
import axios from 'axios';
import { useMutation, useQuery } from '@tanstack/react-query';
import { userResponseToData, type UserData, type UserResponse } from '../interfaces/User';
import apiClient from '../util/apiClient';
import { useAuthStatus } from '../util/authStatus';
import tokenStore from '../util/tokenStore';
import LoginForm from './LoginForm';
import SignUpForm from './SignUpForm';
import Transition from './Transition';
import useOutsideClick from '../hooks/useOutsideClick';

async function getUser(): Promise<UserData> {
  const data: UserResponse = (await apiClient.get(`/users/me`)).data;

  return userResponseToData(data);
}

async function logoutUser() {
  await apiClient.post('/auth/logout');
}

function Profile() {
  const authed = useAuthStatus((state) => state.authed);
  const authLogout = useAuthStatus((state) => state.logout);

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
      }
  });

  const {
    mutate: logout,
    isPending: isLoggingOut,
    isError: isLogoutError,
  } = useMutation({
    mutationFn: logoutUser,
  });

  const containerRef = React.useRef<HTMLDivElement>(null);
    
  useOutsideClick(containerRef, () => setOpen(false));

  function handleLogout() {
    setIsLoginPage(true);
    
    authLogout();

    tokenStore.clear();

    logout();
  }

  return (
    <div
      ref={containerRef}
      className="w-[calc(100%-0.5rem)] max-w-md m-1 fixed right-0 top-0 flex flex-col items-end"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-32 cursor-pointer bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-2 mb-1 shadow-md"
      >
        {
          (isLoading || isLoggingOut) ?
            <div>
              Загрузка...
            </div>
          :
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
        }
      </button>
      {
        <Transition
          appear={!isLoggingOut && !isLoading && open || isLogoutError}
          onAppearStyle={{
            marginRight: '0px',
            transitionProperty: 'margin-right',
          }}
          onDisappearStyle={{
            marginRight: '-500px',
            transitionProperty: 'margin-right',
          }}
          duration={250}
          className="w-full h-full relative"
        >
          {
            authed ?
              <div
                className="w-[calc(100%-0.5rem)] max-w-md bg-mist-100 dark:bg-mist-800 border border-mist-400 rounded-2xl dark:border-mist-600 p-2 shadow-md"
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
                <button
                  onClick={handleLogout}
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
                  Выйти
                </button>
                {
                  isLogoutError && 
                    <div
                      className="text-center mt-2 p-1 rounded-xl bg-red-200 dark:bg-red-900"
                    >
                      Произошла ошибка во время выхода
                    </div>
                }
              </div>
            :
            <>
              <Transition
                appear={isLoginPage}
                onAppearStyle={{
                  right: '0px',
                  transitionProperty: 'right',
                }}
                onDisappearStyle={{
                  right: '-500px',
                  transitionProperty: 'right',
                }}
                delay={250}
                duration={250}
                ignoreOnInit={true}
                className="w-full h-full absolute"
              >
                <LoginForm 
                  goToSignUp={() => setIsLoginPage(false)}
                />
              </Transition>
              <Transition
                appear={!isLoginPage}
                onAppearStyle={{
                  right: '0px',
                  transitionProperty: 'right',
                }}
                onDisappearStyle={{
                  right: '-500px',
                  transitionProperty: 'right',
                }}
                delay={250}
                duration={250}
                ignoreOnInit={true}
                className="w-full h-full absolute"
              >
                <SignUpForm
                  goToLogin={() => setIsLoginPage(true)}
                />
              </Transition>
            </>
              // isLoginPage ? 
              //   <LoginForm 
              //     goToSignUp={() => setIsLoginPage(false)}
              //   />
              // :
              //   <SignUpForm
              //     goToLogin={() => setIsLoginPage(true)}
              //   />
          }
        </Transition>
      }
    </div>
  );
}

export default Profile;