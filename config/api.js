const ENV = "production"; //"development"

const BASE_URLS = {
  development: "http://192.168.0.200:8080",
  production: "https://fuo-wallet-backend.onrender.com",
};

export const API_URL = `${BASE_URLS[ENV]}/api`;
