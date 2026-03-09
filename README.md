# FUO Wallet - Frontend (Mobile Application)

This is the React Native mobile app for the FUO Wallet System. It allows users to manage their wallet, fund it via Paystack, check their FUC token balance, send tokens to other users and view their transaction history, all from an application on their phone.

**Related repositories:**

- Backend (Node.js/Express): [fuo-wallet-backend](https://github.com/adetolaa99/backend-prj)
- Web App (React): [fuo-wallet-web](https://github.com/adetolaa99/fuo-wallet-web)

---

## Tech Stack

| Layer     | Technology   |
| --------- | ------------ |
| Framework | React Native |
| Payments  | Paystack     |

---

## Getting Started

### Prerequisites

- Node.js v18+
- Expo CLI or React Native CLI
- Android Studio (for Android) or Xcode (for iOS)
- The backend server running locally or deployed

### Installation

```bash
git clone https://github.com/adetolaa99/mobile-prj.git
cd mobile-prj
npm install
```

### Environment Variables

Create a `.env` file in the root directory:

```env
API_BASE_URL=http://localhost:9000
```

For production, set this to your deployed backend URL.

### Running the App

```bash
npm start
```

Then press `a` for Android or `i` for iOS in the Expo terminal.

---

## License

This project is licensed under the [MIT License](LICENSE).

---
