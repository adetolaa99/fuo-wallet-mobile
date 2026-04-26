import React, { useEffect } from "react";
import RootNavigator from "./navigation/RootNavigator.js";

export default function App() {
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        console.log("OneSignal: starting init");
        const OneSignal = (await import("react-native-onesignal")).default;
        console.log("OneSignal: module imported successfully");
        OneSignal.initialize(process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID);
        console.log(
          "OneSignal initialized with App ID:",
          process.env.EXPO_PUBLIC_ONESIGNAL_APP_ID,
        );
        OneSignal.Notifications.requestPermission(true);
        console.log("OneSignal: permission requested");
      } catch (e) {
        console.warn("OneSignal init failed (expected in Expo Go):", e);
      }
    };

    void initOneSignal();
  }, []);

  return <RootNavigator />;
}
