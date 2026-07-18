import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  serverIp: string;
  savedTokens: Record<string, string>; // IP -> Token eşleşmesi
}

const initialState: SettingsState = {
  serverIp: '',
  savedTokens: {},
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
  },
});

export const { setServerIp, saveToken } = settingsSlice.actions;
export default settingsSlice.reducer;
