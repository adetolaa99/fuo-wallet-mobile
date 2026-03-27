import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthNavigator from "./AuthNavigator.js";
import AppNavigator from "./AppNavigator.js";
import { usePushNotifications } from "../hooks/usePushNotifications.js";

const Stack = createNativeStackNavigator();

const AppWithPush = () => {
  usePushNotifications();
  return <AppNavigator />;
};

const RootNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthNavigator} />
        <Stack.Screen name="App" component={AppWithPush} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
