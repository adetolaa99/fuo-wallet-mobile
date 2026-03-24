import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import { API_URL } from "../config/api";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const FundWalletForm = forwardRef((props, ref) => {
  const { onRefresh } = props;
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [showWebView, setShowWebView] = useState(false);
  const [authorizationUrl, setAuthorizationUrl] = useState("");
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  const handleFundWallet = async () => {
    if (!amount) {
      Alert.alert("Error!", "Please enter an amount");
      return;
    }
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error!", "No auth token found");
        setLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/paystack/create-payment-intent`,
        {
          amount: amount,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Payment Intent Response: ", response.data);
      setPaymentIntent(response.data);
      setAuthorizationUrl(response.data.data.authorization_url);
      setShowWebView(true);
    } catch (error) {
      console.error("Funding Error: ", error);
      Alert.alert(
        "Error",
        error.response ? error.response.data : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (reference) => {
    setVerifyingPayment(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error!", "No auth token found");
        setLoading(false);
        return;
      }

      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;

      console.log("Verifying payment with reference: ", reference);

      const response = await axios.post(
        `${API_URL}/paystack/verify-payment`,
        {
          reference: reference,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log("Verification Response: ", response.data);

      if (response.data.success) {
        console.log("Verification successful. Minting tokens...");
        const mintResponse = await axios.post(
          `${API_URL}/paystack/mint-tokens`,
          {
            userId: userId,
            amount: amount,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("Mint Tokens Response: ", mintResponse.data);
        Alert.alert("Success", "You've successfully funded your wallet!");
        onRefresh();
      } else {
        Alert.alert("Error", "Payment verification failed!");
      }
    } catch (error) {
      console.error("Payment verification error: ", error);
      Alert.alert("Error", "Payment verification failed");
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleWebViewNavigationStateChange = (navState) => {
    console.log("WebView Navigation State Change: ", navState.url);
    if (
      navState.url.includes("https://192.168.0.200:8080/api/paystack/callback")
    ) {
      setShowWebView(false);
      const urlParams = new URLSearchParams(navState.url.split("?")[1]);
      const reference = urlParams.get("reference");
      handlePaymentSuccess(reference);
    }
  };

  const resetForm = () => {
    setAmount("");
  };

  useImperativeHandle(ref, () => ({
    refreshForm: () => {
      resetForm();
    },
  }));

  return (
    <View style={styles.formContainer}>
      <TextInput
        style={styles.input}
        placeholder="Enter amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleFundWallet}
        disabled={loading || verifyingPayment}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Fund Wallet</Text>
        )}
      </TouchableOpacity>

      {verifyingPayment && (
        <View style={styles.verifyingContainer}>
          <ActivityIndicator size="small" color="#006400" />
          <Text style={styles.verifyingText}>
            Please wait, verifying payment...
          </Text>
        </View>
      )}

      {showWebView && (
        <WebView
          source={{ uri: authorizationUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onError={(error) => console.error("WebView Error: ", error)}
          onLoad={() => console.log("WebView loaded")}
          onLoadStart={() => console.log("WebView load started")}
          onLoadEnd={() => console.log("WebView load ended")}
          style={{ marginTop: 20, height: 600, width: "100%" }}
        />
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    padding: 20,
    justifyContent: "center",
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    width: "100%",
  },
  button: {
    backgroundColor: "#006400",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  verifyingContainer: {
    marginTop: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  verifyingText: {
    color: "#006400",
    marginTop: 10,
  },
});

export default FundWalletForm;
