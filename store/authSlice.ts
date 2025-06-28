
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ServerInfoResponse,LoginResponse  } from '../screens/types';

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
  async (inn: string): Promise<string> => {
    const response = await fetch('http://app.atp-online.ru/driver_app/get_host.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inn }),
    });

    const json = await response.json();
    if (
      typeof json !== 'object' ||
      json === null ||
      !('port' in json) ||
      typeof (json as any).port !== 'number'
    )  {
      throw new Error('Неверный формат ответа сервера');
    }

    const data = json as ServerInfoResponse;

    if (data.port === 0) {
      throw new Error('Подключение невозможно. Обратитесь к системному администратору организации');
    }

    const protocol = data.is_ssl_port === 1 ? 'https' : 'http';
const baseUrl = `${protocol}://${data.host}:${data.port}/api/v1/driver_mode`;

    return baseUrl;
  }
);


export const loginUser = createAsyncThunk<
  { accessToken: string; refreshToken: string | null }, // Возвращаемое значение при успехе
  { login: string; password: string; baseUrl: string }, // Аргументы
  { rejectValue: string } // Тип ошибки при отклонении
>(
  'auth/loginUser',
  async ({ login, password, baseUrl }, thunkAPI) => {
    try {
      const response = await fetch(`${baseUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: login, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Сервер вернул ошибку авторизации:', errorText);
        return thunkAPI.rejectWithValue(errorText || 'Неверный логин или пароль');
      }

      const json = await response.json();
      console.log('Ответ от сервера:', json);

      if (typeof json !== 'object' || json === null || !('token' in json)) {
        return thunkAPI.rejectWithValue('Токен не получен или структура ответа некорректна');
      }

      const data: LoginResponse = {
        token: json.token,
        refresh: json.refresh ?? null,
      };

      await AsyncStorage.setItem('access_token', data.token);
      if (data.refresh) {
        await AsyncStorage.setItem('refresh_token', data.refresh);
      }

     return {
  accessToken: data.token,
  refreshToken: data.refresh ?? null, 
};
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message || 'Ошибка авторизации');
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
