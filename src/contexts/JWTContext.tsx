import React, { createContext, useEffect, useReducer, useState } from 'react';

// third-party
import { Chance } from 'chance';
import { jwtDecode } from 'jwt-decode';

// reducer - state management
import { LOGIN, LOGOUT } from 'contexts/auth-reducer/actions';
import authReducer from 'contexts/auth-reducer/auth';

// project-imports
import Loader from 'components/Loader';
import axios from 'utils/axios';
import { fetchAllAdvancedPermissions } from 'api/permissions-advanced';

// types
import { AuthProps, JWTContextType } from 'types/auth';
import { KeyedObject } from 'types/root';

const chance = new Chance();

// constant
const initialState: AuthProps = {
  isLoggedIn: false,
  isInitialized: false,
  user: null
};

const verifyToken: (st: string) => boolean = (serviceToken) => {
  if (!serviceToken) {
    return false;
  }
  const decoded: KeyedObject = jwtDecode(serviceToken);
  /**
   * Property 'exp' does not exist on type '<T = unknown>(token: string, options?: JwtDecodeOptions | undefined) => T'.
   */
  return decoded.exp > Date.now() / 1000;
};

const setSession = (serviceToken?: string | null) => {
  if (serviceToken) {
    localStorage.setItem('serviceToken', serviceToken);
    axios.defaults.headers.common.Authorization = `Bearer ${serviceToken}`;
  } else {
    localStorage.removeItem('serviceToken');
    delete axios.defaults.headers.common.Authorization;
  }
};

// ==============================|| JWT CONTEXT & PROVIDER ||============================== //

const JWTContext = createContext<JWTContextType | null>(null);

export const JWTProvider = ({ children }: { children: React.ReactElement }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [advancedPermissions, setAdvancedPermissions] = useState<any[]>([]);

  // Carga catálogo y cruza con keys efectivas
  const loadPermissionsCatalog = async (effectiveKeys: string[]) => {
    try {
      const catalog = await fetchAllAdvancedPermissions();
      if (effectiveKeys && effectiveKeys.length > 0) {
        const filtered = catalog.filter((p) => effectiveKeys.some(k => k.toLowerCase() === (p.key || '').toLowerCase()));
        setAdvancedPermissions(filtered);
      } else {
        setAdvancedPermissions([]);
      }
    } catch (e) {
      console.error('Error cargando catálogo de permisos', e);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        const serviceToken = window.localStorage.getItem('serviceToken');
        if (serviceToken && verifyToken(serviceToken)) {
          setSession(serviceToken);
          const response = await axios.get('/api/account/me', {
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${serviceToken}` }
          });
          const { Message } = response.data;
          const payload = Message?.user ? Message : { user: Message?.user, permissions: Message?.permissions, menus: Message?.menus };
          const user = payload.user || Message?.user || null;
          const permissions = payload.permissions || [];

          dispatch({
            type: LOGIN,
            payload: { isLoggedIn: true, user, permissions, menus: payload.menus }
          });
          await loadPermissionsCatalog(permissions);
        } else {
          dispatch({ type: LOGOUT });
        }
      } catch (err) {
        console.error(err);
        dispatch({ type: LOGOUT });
      }
    };
    init();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await axios.post('api/Auth/signIn', { email, password });
    const { Message } = response.data;
    const { serviceToken, user, menus, permissions = [] } = Message;
    setSession(serviceToken);
    dispatch({ type: LOGIN, payload: { isLoggedIn: true, user, permissions, menus } });
    await loadPermissionsCatalog(permissions);
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    // todo: this flow need to be recode as it not verified
    const id = chance.bb_pin();
    const response = await axios.post('/api/account/register', {
      id,
      email,
      password,
      firstName,
      lastName
    });
    let users = response.data.Message;

    if (window.localStorage.getItem('users') !== undefined && window.localStorage.getItem('users') !== null) {
      const localUsers = window.localStorage.getItem('users');
      users = [
        ...JSON.parse(localUsers!),
        {
          id,
          email,
          password,
          name: `${firstName} ${lastName}`
        }
      ];
    }

    window.localStorage.setItem('users', JSON.stringify(users));
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: LOGOUT });
    setAdvancedPermissions([]);
  };

  const resetPassword = async (email: string) => {
    console.log('email - ', email);
  };

  const updateProfile = () => {};

  if (state.isInitialized !== undefined && !state.isInitialized) {
    return <Loader />;
  }

  return <JWTContext.Provider value={{ ...state, advancedPermissions, login, logout, register, resetPassword, updateProfile }}>{children}</JWTContext.Provider>;
};

export default JWTContext;
