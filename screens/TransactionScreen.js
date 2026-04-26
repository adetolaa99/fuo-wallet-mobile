import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import axios from "axios";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useFocusEffect } from "@react-navigation/native";

const TransactionScreen = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPublicKey, setUserPublicKey] = useState("");

  const fetchTransactions = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) {
        Alert.alert("Error!", "No token found! Please log in again.");
        setLoading(false);
        return;
      }
      const decodedToken = jwtDecode(token);
      const userId = decodedToken.userId;
      if (!userId) throw new Error("User ID not found in token");

      const profile = JSON.parse(await AsyncStorage.getItem("profile"));
      if (profile?.stellarPublicKey) setUserPublicKey(profile.stellarPublicKey);

      const response = await axios.get(
        `${API_URL}/stellar/transactions/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setTransactions(response.data.length > 0 ? response.data : []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      Alert.alert("Error", "Failed to fetch transactions. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchTransactions();
    }, []),
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTransactions();
  }, []);

  const renderItem = ({ item }) => {
    const isFunding = item.from === "PAYSTACK_FUNDING";
    const isOutgoing = !isFunding && item.from === userPublicKey;

    return (
      <View
        style={[
          styles.transactionItem,
          isFunding
            ? styles.funding
            : isOutgoing
              ? styles.outgoing
              : styles.incoming,
        ]}
      >
        <Text
          style={[
            styles.typeLabel,
            isFunding
              ? styles.fundingLabel
              : isOutgoing
                ? styles.outgoingLabel
                : styles.incomingLabel,
          ]}
        >
          {isFunding ? "+ Funded" : isOutgoing ? "↑ Sent" : "↓ Received"}
        </Text>
        {isFunding ? (
          <>
            <Text style={styles.transactionText}>
              <Text style={styles.label}>Amount: </Text>
              {item.assetAmount} {item.assetCode}
            </Text>
            <Text style={styles.transactionText}>
              <Text style={styles.label}>Date: </Text>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </>
        ) : isOutgoing ? (
          <>
            <Text style={styles.transactionText}>
              <Text style={styles.label}>To: </Text>
              {item.to}
            </Text>
            <Text style={styles.transactionText}>
              <Text style={styles.label}>Amount: </Text>
              {item.assetAmount} {item.assetCode}
            </Text>
            <Text style={styles.transactionText}>
              <Text style={styles.label}>Date: </Text>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.transactionText}>
              <Text style={styles.label}>From: </Text>
              {item.from}
            </Text>
            <Text style={styles.transactionText}>
              <Text style={styles.label}>Amount: </Text>
              {item.assetAmount} {item.assetCode}
            </Text>
            <Text style={styles.transactionText}>
              <Text style={styles.label}>Date: </Text>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#006400" />
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderItem}
          keyExtractor={(item) => item.transactionId.toString()}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No transactions found</Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  transactionItem: {
    backgroundColor: "#fff",
    padding: 20,
    marginVertical: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    borderLeftWidth: 4,
  },
  outgoing: {
    borderLeftColor: "#dc3545",
  },
  incoming: {
    borderLeftColor: "#006400",
  },
  funding: {
    borderLeftColor: "#007bff",
  },
  fundingLabel: {
    color: "#007bff",
  },
  typeLabel: {
    fontWeight: "bold",
    marginBottom: 8,
    fontSize: 14,
  },
  outgoingLabel: {
    color: "#dc3545",
  },
  incomingLabel: {
    color: "#006400",
  },
  transactionText: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  label: {
    fontWeight: "bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: "#888",
  },
});

export default TransactionScreen;
