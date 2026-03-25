import React, { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AuthNavigator from "./AuthNavigator.js";
import AppNavigator from "./AppNavigator.js";
import { usePushNotifications } from "../hooks/usePushNotifications.js";
import { jwtDecode } from "jwt-decode";

const Stack = createNativeStackNavigator();

const AppWithPush = () => {
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const loadUserId = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decoded = jwtDecode(token);
          setUserId(decoded.userId ?? null);
        }
      } catch (error) {
        console.warn("Failed to load userId for push registration:", error);
      }
    };
    void loadUserId();
  }, []);

  usePushNotifications(userId);

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
