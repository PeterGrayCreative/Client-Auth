import axios from 'axios';
// Fixes an issue with axios and express-session where sessions
// would not persist between routes
axios.defaults.withCredentials = true;
const ROOT_URL = 'http://localhost:5000';

export const USER_REGISTERED = 'USER_REGISTERED';
export const USER_AUTHENTICATED = 'USER_AUTHENTICATED';
export const USER_UNAUTHENTICATED = 'USER_UNAUTHENTICATED';
export const AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR';
export const GET_USERS = 'GET_USERS';
export const CHECK_IF_AUTHENTICATED = 'CHECK_IF_AUTHENTICATED';

export const authError = (error) => {
  return {
    type: AUTHENTICATION_ERROR,
    payload: error,
  };
};

export const isAuthenticated = () => {
  return (dispatch) => ({
    type: CHECK_IF_AUTHENTICATED,
  });
};

export const register = (username, password, confirmPassword, history) => {
  return (dispatch) => {
    if (password !== confirmPassword) {
      dispatch(authError('Passwords do not match'));
      return;
    }
    axios
      .post(`${ROOT_URL}/api/users`, { username, password })
      .then(() => {
        dispatch({
          type: USER_REGISTERED,
        });
        history.push('/signin');
      })
      .catch(() => {
        dispatch(authError('Failed to register user'));
      });
  };
};

export const login = (username, password, history) => {
  return (dispatch) => {
    axios
      .post(`${ROOT_URL}/api/login`, { username, password })
      .then(({ data }) => {
        dispatch({
          type: USER_AUTHENTICATED,
        });
        localStorage.setItem('token', data.token);
        history.push('/users');
      })
      .catch(() => {
        dispatch(authError('Incorrect username/password combo'));
      });
  };
};

export const logout = () => {
  return { type: USER_UNAUTHENTICATED }
};

export const getUsers = () => {
  return (dispatch) => {
    axios
      .get(`${ROOT_URL}/api/users`, {
        headers: {
          authorization: localStorage.getItem('token'),
        },
      })
      .then((response) => {
        dispatch({
          type: GET_USERS,
          payload: response.data,
        });
        dispatch({
          type: USER_AUTHENTICATED,
        });
      })
      .catch(() => {
        dispatch(authError('Failed to fetch users'));
      });
  };
};
