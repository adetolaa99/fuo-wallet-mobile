import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { View, Text, StyleSheet, ActivityIndicator, Alert } from "react-native";
import axios from "axios";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BalanceForm = forwardRef((props, ref) => {
  const [loading, setLoading] = useState(false);
  const [balances, setBalances] = useState([]);
  const [publicKey, setPublicKey] = useState(null);

  const assetTypeNames = {
    credit_alphanum4: "FUC",
    native: "XLM",
  };

  useEffect(() => {
    const fetchPublicKey = async () => {
      try {
        const profile = JSON.parse(await AsyncStorage.getItem("profile"));
        if (profile && profile.stellarPublicKey) {
          setPublicKey(profile.stellarPublicKey);
          handleCheckBalance(profile.stellarPublicKey);
        } else {
          Alert.alert(
            "Error!",
            "Public key not found. Please ensure you are logged in."
          );
        }
      } catch (error) {
        Alert.alert(
          "Error!",
          "Failed to retrieve profile data. Please try again."
        );
      }
    };

    fetchPublicKey();
  }, []);

  const handleCheckBalance = async (publicKey) => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(
        `${API_URL}/stellar/check-balance/${publicKey}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setBalances(response.data.balances);
    } catch (error) {
      Alert.alert(
        "Error!",
        error.response ? error.response.data : "Something went wrong!"
      );
    } finally {
      setLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    refreshBalances: () => {
      if (publicKey) {
        handleCheckBalance(publicKey);
      }
    },
  }));

  return (
    <View style={styles.formContainer}>
      {loading ? (
        <ActivityIndicator size="large" color="#006400" />
      ) : (
        balances.length > 0 && (
          <View style={styles.balancesContainer}>
            {balances.map((balance, index) => (
              <View key={index} style={styles.balanceItem}>
                <Text style={styles.balanceText}>
                  {assetTypeNames[balance.asset_type] || balance.asset_type}:{" "}
                  {balance.balance}
                </Text>
              </View>
            ))}
          </View>
        )
      )}
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
  balancesContainer: {
    marginTop: 15,
    width: "100%",
  },
  balanceItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  balanceText: {
    fontSize: 16,
  },
});

export default BalanceForm;
