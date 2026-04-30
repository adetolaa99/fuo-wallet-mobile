import axios from "axios";
import { API_URL } from "./api";

export const registerDeviceToken = async (deviceToken, platform) => {
  try {
    const AsyncStorage = (
      await import("@react-native-async-storage/async-storage")
    ).default;
    const token = await AsyncStorage.getItem("authToken");
    if (!token) return;

    await axios.post(
      `${API_URL}/users/register-device`,
      { deviceToken, platform },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (error) {
    console.warn("Failed to register device:", error?.message);
  }
};
