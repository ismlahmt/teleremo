import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AppMode = 'PC' | 'TV' | null;

interface SettingsState {
  serverIp: string;
  savedTokens: Record<string, string>;
  appMode: AppMode;
  tvIp: string;
}

const initialState: SettingsState = {
  serverIp: '',
  savedTokens: {},
  appMode: null,
  tvIp: '',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setServerIp: (state, action: PayloadAction<string>) => {
      state.serverIp = action.payload;
    },
    saveToken: (state, action: PayloadAction<{ip: string, token: string}>) => {
      state.savedTokens[action.payload.ip] = action.payload.token;
    },
    setAppMode: (state, action: PayloadAction<AppMode>) => {
      state.appMode = action.payload;
    },
    setTvIp: (state, action: PayloadAction<string>) => {
      state.tvIp = action.payload;
    },
  },
});

export const { setServerIp, saveToken, setAppMode, setTvIp } = settingsSlice.actions;
export default settingsSlice.reducer;
