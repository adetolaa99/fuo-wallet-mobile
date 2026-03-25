import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { registerDeviceToken } from "../config/messagepipe";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const usePushNotifications = (userId) => {
  useEffect(() => {
    if (!userId) return;

    const registerForPushNotifications = async () => {
      if (!Device.isDevice) {
        console.log("Push notifications require a physical device");
        return;
      }

      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Push notification permission not granted");
        return;
      }

      const token = await Notifications.getDevicePushTokenAsync();
      const platform = Platform.OS;

      await registerDeviceToken(userId, token.data, platform);
    };

    void registerForPushNotifications();
  }, [userId]);
};
