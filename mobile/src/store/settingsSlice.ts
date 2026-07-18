import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SettingsState {
  serverIp: string;
  savedPins: Record<string, string>; // IP -> PIN eşleşmesi
}

const initialState: SettingsState = {
  serverIp: '',
  savedPins: {},
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setServerIp: (state, action: PayloadAction<string>) => {
      state.serverIp = action.payload;
    },
    savePin: (state, action: PayloadAction<{ip: string, pin: string}>) => {
      state.savedPins[action.payload.ip] = action.payload.pin;
    },
  },
});

export const { setServerIp, savePin } = settingsSlice.actions;
export default settingsSlice.reducer;
