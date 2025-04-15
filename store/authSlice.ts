
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  login: string;
  password: string;
  inn: string;
  baseUrl: string;
  accessToken: string | null;
  refreshToken: string | null;
}

const initialState: AuthState = {
  login: '',
  password: '',
  inn: '',
  baseUrl: '',
  accessToken: null,
  refreshToken: null,
};

export const fetchServerInfo = createAsyncThunk(
  'auth/fetchServerInfo',
  async (inn: string) => {
    const response = await fetch('https://app.atp-online.ru/driver_app/get_info.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inn }),
    });
    const data = await response.json();
    if (!data.host || !data.port) {
      throw new Error('Не удалось получить сервер');
    }
    return `http://${data.host}:${data.port}/api/v1/driver_mode`;
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (
    { login, password, baseUrl }: { login: string; password: string; baseUrl: string },
    thunkAPI
  ) => {
    const response = await fetch(`${baseUrl}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ login, password }),
    });

    if (!response.ok) {
      throw new Error('Ошибка авторизации');
    }

    const data = await response.json();

    if (data.token) {
      await AsyncStorage.setItem('access_token', data.token);
      if (data.refresh_token) {
        await AsyncStorage.setItem('refresh_token', data.refresh_token);
      }
      return {
        accessToken: data.token,
        refreshToken: data.refresh_token,
      };
    } else {
      throw new Error('Токен не получен');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLogin: (state, action: PayloadAction<string>) => {
      state.login = action.payload;
    },
    setPassword: (state, action: PayloadAction<string>) => {
      state.password = action.payload;
    },
    setInn: (state, action: PayloadAction<string>) => {
      state.inn = action.payload;
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchServerInfo.fulfilled, (state, action) => {
      state.baseUrl = action.payload;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    });
  },
});

export const { setLogin, setPassword, setInn, setTokens } = authSlice.actions;
export default authSlice.reducer;
