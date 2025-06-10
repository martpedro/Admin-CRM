import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// project-imports
import { fetcher } from 'utils/axios';

// types
import { UserList, UserProps } from 'types/user';

const initialState: UserProps = {
  modal: false
};

// ==============================|| API - User ||============================== //

const endpoints = {
  key: 'api/User',
  list: '/list', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete' // server URL
};

export function useGetUser() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.list, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      Users: data?.Users as UserList[] || [],
      UsersLoading: isLoading,
      UsersError: error,
      UsersValidating: isValidating,
      UsersEmpty: !isLoading && !data?.Users?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function insertUser(newUser: UserList) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentUser: any) => {
      newUser.id = currentUser.Users.length + 1;
      const addedUser: UserList[] = [...currentUser.Users, newUser];

      return {
        ...currentUser,
        Users: addedUser
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { newUser };
  //   await axios.post(endpoints.key + endpoints.insert, data);
}

export async function updateUser(UserId: number, updatedUser: UserList) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentUser: any) => {
      const newUser: UserList[] = currentUser.Users.map((User: UserList) =>
        User.id === UserId ? { ...User, ...updatedUser } : User
      );

      return {
        ...currentUser,
        Users: newUser
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { list: updatedUser };
  //   await axios.post(endpoints.key + endpoints.update, data);
}

export async function deleteUser(UserId: number) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentUser: any) => {
      const nonDeletedUser = currentUser.Users.filter((User: UserList) => User.id !== UserId);

      return {
        ...currentUser,
        Users: nonDeletedUser
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { UserId };
  //   await axios.post(endpoints.key + endpoints.delete, data);
}

export function useGetUserMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      UserMaster: data,
      UserMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerUserDialog(modal: boolean) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentUsermaster: any) => {
      return { ...currentUsermaster, modal };
    },
    false
  );
}
