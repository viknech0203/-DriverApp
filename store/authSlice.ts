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

export const loginUser = createAsyncThunk<
  { accessToken: string; refreshToken: string | null },
  { login: string; password: string; inn: string },
  { rejectValue: string }
>('auth/loginUser', async ({ login, password, inn }, thunkAPI) => {
  try {
    console.log('[LOGIN DEBUG] Получаем хост по ИНН:', inn);

    const hostResponse = await fetch('https://app.atp-online.ru/driver_app/get_host.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inn }),
    });

    const hostJson = await hostResponse.json();
    console.log('[LOGIN DEBUG] Ответ от get_host.php:', hostJson);

    if (!hostJson || hostJson.port === 0 || !hostJson.host) {
      throw new Error('Подключение невозможно. Обратитесь к системному администратору организации');
    }

    const rawHost = {
      ip: hostJson.host,
      port: hostJson.port,
      is_ssl_port: true,
    };

    const hostWithAuthEndpoint = {
      ...rawHost,
      endpoint: 'api/v1/driver_mode/auth',
    };

    //  Проверяем структуру хоста перед отправкой
    if (
      typeof hostWithAuthEndpoint !== 'object' ||
      !hostWithAuthEndpoint.ip ||
      !hostWithAuthEndpoint.port ||
      !hostWithAuthEndpoint.endpoint
    ) {
      console.error('[LOGIN ERROR] Неверная структура host:', hostWithAuthEndpoint);
      return thunkAPI.rejectWithValue('Неверная структура параметров подключения (host)');
    }



      const body = {

  host: {
    ip: hostJson.host,
    port: hostJson.port,
    is_ssl_port: true,
    endpoint: 'api/v1/driver_mode/auth',
  },
  user: login,
  password,
};

console.log('[LOGIN DEBUG] Сформированное тело запроса:', JSON.stringify(body, null, 2));



console.log('[LOGIN DEBUG] Отправляем JSON:', JSON.stringify({
  user: login,
  password: password,
  host: {
    ip: hostJson.host,
    port: hostJson.port,
    is_ssl_port: true,
    endpoint: 'api/v1/driver_mode/auth',
  }
}, null, 2));




const response = await fetch('https://app.atp-online.ru/driver_app/get_data.php', {
  method: 'POST',
  headers: {
    // 'Accept': '*/*',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    user: login,
    password: password,
    host: {
      ip: hostJson.host,
      port: hostJson.port,
      is_ssl_port: hostJson.is_ssl_port,
      endpoint: 'api/v1/driver_mode/auth',
    }
  }),
});


const rawText = await response.text();
console.log('[LOGIN DEBUG] RAW ответ от сервера:', rawText);

let json;
try {
  json = JSON.parse(rawText);
} catch (e) {
  console.error('[LOGIN ERROR] Невозможно распарсить JSON:', e);
  return thunkAPI.rejectWithValue('Ошибка при разборе ответа от сервера');
}

if (!json.token) {
  console.error('[LOGIN ERROR] Токен не найден в ответе:', json);
  return thunkAPI.rejectWithValue('Ошибка: токен не получен от сервера');
}


    await AsyncStorage.setItem('access_token', json.token);
    if (json.refresh) {
      await AsyncStorage.setItem('refresh_token', json.refresh);
    }

    //  Сохраняем хост отдельно с endpoint для get_info
    const hostWithInfoEndpoint = {
      ...rawHost,
      endpoint: 'api/v1/driver_mode/get_info',
    };

    await AsyncStorage.setItem(
      'server_host',
      JSON.stringify(hostWithInfoEndpoint)
    );

    return {
      accessToken: json.token,
      refreshToken: json.refresh ?? null,
    };
  } catch (err: any) {
    console.error('[LOGIN ERROR] Ошибка авторизации:', err.message);
    return thunkAPI.rejectWithValue(err.message || 'Ошибка авторизации');
  }
});

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
    setBaseUrl: (state, action: PayloadAction<string>) => {
      state.baseUrl = action.payload;
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
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    });
  },
});

export const { setLogin, setPassword, setInn, setBaseUrl, setTokens } = authSlice.actions;
export default authSlice.reducer;





