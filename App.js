import React, { useEffect } from "react";
import RootNavigator from "./navigation/RootNavigator.js";
import OneSignal from "react-native-onesignal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export default function App() {
  useEffect(() => {
    OneSignal.initialize(process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID);
    OneSignal.Notifications.requestPermission(true);

    const setExternalId = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          const decoded = jwtDecode(token);
          if (decoded.userId) {
            OneSignal.login(decoded.userId);
          }
        }
      } catch (e) {
        console.warn("OneSignal: failed to set external ID on init", e);
      }
    };

    void setExternalId();
  }, []);

  return <RootNavigator />;
}
