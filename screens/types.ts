// types.ts

export type Document = {
  name: string;
  nomer: string;
  date_from: string;
  date_to: string;
};

export type Driver = {
  fio: string;
  docs?: Document[];
};

export type TrackClient = {
  client_id: string;
  client: string;
};

export type StatusItem = {
  status_id: string;
  name: string;
};

export type RouteTrack = {
  client: string;
  note: string;
  division: string;
  arrival: string;
  departure: string;
  contacts: string;
  razn_zak_id: string;
  client_id: string;
};

// Один рейс
export type Route = {
  mam: string;
  nomer: string;
  info: string;
  date_begin: string;
  date_end: string;
  departure: string;
  arrival: string;
  razn_id: string;
  track: RouteTrack[];
};

// Ответ от /get_info
export type FlightData = {
  driver: Driver;
  route: Route[];
};

export type InfoResponse = {
  clients?: TrackClient[];
  driver?: Driver;
  route?: Route[];
};

export type DirResponse = {
  status_dir: {
    status_id: string;
    name: string;
  }[];
};

export type StatusHistoryItem = {
  stamp: string;
  status: string;
  vol: string;
  text: string;
};

export type HistoryResponse = {
  status_list?: StatusHistoryItem[];
};

export type SetStatusResponse = {
  status?: {
    code: number;
    text?: string;
  };
};

export interface ChatItem {
  id: string;
  stamp: string;
  chat_msg: string;
  autor: "V" | "D";
  file_name?: string;
  file_?: string;
}

export interface ChatResponse {
  chat: ChatItem[];
}

export type RootStackParamList = {
  AuthScreen: undefined;
  MainTabs: undefined;
  FlightInfoScreen: undefined;
  Chat: undefined;
  FlightStatus: undefined;
  DriverInfo: { driver: string };
  Main: undefined;
};

export type ServerInfoResponse = {
  host: string;
  port: number;
  is_ssl_port: 0 | 1;
};

export type LoginResponse = {
  token: string;
  refresh?: string;
};
