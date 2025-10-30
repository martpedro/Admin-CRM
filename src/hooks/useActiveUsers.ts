import { useEffect, useState } from 'react';
import axiosServices from 'utils/axios';
import { User } from 'types/permission';

export function useActiveUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const response = await axiosServices.get('/api/user/active');
        console.log('Respuesta backend usuarios:', response.data);
        const mapped = Array.isArray(response.data)
          ? response.data.map((u: any) => ({
              id: u.id ?? u.Id ?? 0,
              name: u.name ?? u.Name ?? '',
              lastName: u.lastName ?? u.LastName ?? u.LastNAme ?? '',
              email: u.email ?? u.Email ?? '',
              isActive: u.isActive ?? u.IsActive ?? true
            }))
          : [];
        setUsers(mapped);
      } catch (error) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return { users, loading };
}
