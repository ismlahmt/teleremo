import React from 'react';
import { Provider } from 'react-redux';
import { StatusBar } from 'expo-status-bar';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './src/store';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ActivityIndicator, View, Text } from 'react-native';

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={<View style={{flex:1,backgroundColor:'#0F172A',justifyContent:'center',alignItems:'center'}}><ActivityIndicator color="#10B981" /></View>} persistor={persistor}>
        <StatusBar style="light" />
        <AppNavigator />
      </PersistGate>
    </Provider>
  );
}
