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
import AsyncStorage from "@react-native-async-storage/async-storage";

const TransferForm = forwardRef((props, ref) => {
  const [receiverPublicKey, setReceiverPublicKey] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTransfer = async () => {
    if (!receiverPublicKey || !amount) {
      Alert.alert(
        "Error!",
        "Please enter both the receiver's public key and the amount",
      );
      return;
    }

    Alert.alert(
      "Confirm Transfer",
      `Send ${amount} FUC to ${receiverPublicKey.slice(0, 10)}...${receiverPublicKey.slice(-6)}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setLoading(true);
            try {
              const token = await AsyncStorage.getItem("authToken");
              if (!token) {
                Alert.alert("Error!", "No auth token found");
                setLoading(false);
                return;
              }
              await axios.post(
                `${API_URL}/stellar/transfer`,
                { receiverPublicKey, amount },
                { headers: { Authorization: `Bearer ${token}` } },
              );
              Alert.alert(
                "Success!",
                "You've successfully transferred FUC to another user.",
              );
              resetForm();
            } catch (error) {
              let errorMessage = "Something went wrong";
              if (error.response) {
                if (
                  error.response.status === 400 &&
                  error.response.data === "The receiver account does not exist!"
                ) {
                  errorMessage =
                    "The receiver's public key is invalid! Please check and try again.";
                } else {
                  errorMessage = error.response.data;
                }
              }
              Alert.alert("Error", errorMessage);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const resetForm = () => {
    setReceiverPublicKey("");
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
        placeholder="Enter Receiver's Public Key"
        value={receiverPublicKey}
        onChangeText={setReceiverPublicKey}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TouchableOpacity
        style={styles.button}
        onPress={handleTransfer}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Transfer</Text>
        )}
      </TouchableOpacity>
    </View>
  );
});

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
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
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default TransferForm;
