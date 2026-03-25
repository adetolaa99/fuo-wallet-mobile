import axios from "axios";

const MESSAGEPIPE_URL = process.env.EXPO_PUBLIC_MESSAGEPIPE_URL;
const MESSAGEPIPE_API_KEY = process.env.EXPO_PUBLIC_MESSAGEPIPE_API_KEY;

export const registerDeviceToken = async (userId, deviceToken, platform) => {
  try {
    await axios.post(
      `${MESSAGEPIPE_URL}/push/register-device`,
      {
        userId,
        deviceToken,
        provider: "fcm",
        platform,
      },
      {
        headers: {
          "x-api-key": MESSAGEPIPE_API_KEY,
          "Content-Type": "application/json",
        },
      },
    );
    console.log("Device registered with MessagePipe successfully");
  } catch (error) {
    console.warn("Failed to register device with MessagePipe:", error?.message);
  }
};
