import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { API_URL } from "../config/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

const SignInForm = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      setLoading(false);
      setErrorMessage("");
    });
    return unsubscribe;
  }, [navigation]);

  const SignInSchema = Yup.object().shape({
    identifier: Yup.string().required("Required"),
    password: Yup.string().required("Required"),
  });

  const handleSignIn = async (values) => {
    setLoading(true);
    setErrorMessage("");
    try {
      const response = await axios.post(`${API_URL}/users/login`, values);
      console.log("Login successful!");
      const { token, profile } = response.data;
      await AsyncStorage.setItem("authToken", token);
      await AsyncStorage.setItem("profile", JSON.stringify(profile));
      try {
        console.log("OneSignal: attempting login for user:", profile.id);
        const OneSignal = (await import("react-native-onesignal")).default;
        console.log("Attempting OneSignal login with userId:", profile.id);
        OneSignal.login(profile.id);
        console.log("OneSignal: login successful for user:", profile.id);
      } catch (e) {
        console.warn("OneSignal login failed:", e);
      }
      navigation.replace("App");
    } catch (error) {
      console.error("Login error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        setErrorMessage(error.response.data.message || "An error occurred.");
      } else if (error.request) {
        console.error("Request data:", error.request);
        setErrorMessage("No response received from the server.");
      } else {
        console.error("Error message:", error.message);
        setErrorMessage("Error setting up request.");
      }
      setLoading(false);
    }
  };

  return (
    <Formik
      initialValues={{ identifier: "", password: "" }}
      validationSchema={SignInSchema}
      onSubmit={(values) => handleSignIn(values)}
    >
      {({
        handleChange,
        handleBlur,
        handleSubmit,
        values,
        errors,
        touched,
      }) => (
        <View style={styles.formContainer}>
          <TextInput
            placeholder="Username or Email"
            onChangeText={handleChange("identifier")}
            onBlur={handleBlur("identifier")}
            value={values.identifier}
            style={styles.input}
          />
          {errors.identifier && touched.identifier ? (
            <Text style={styles.error}>{errors.identifier}</Text>
          ) : null}

          <View style={styles.passwordContainer}>
            <TextInput
              placeholder="Password"
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              value={values.password}
              style={styles.passwordInput}
              secureTextEntry={!passwordVisible}
            />
            <TouchableOpacity
              onPress={() => setPasswordVisible(!passwordVisible)}
              style={styles.iconContainer}
            >
              <Ionicons
                name={passwordVisible ? "eye-off" : "eye"}
                size={24}
                color="gray"
              />
            </TouchableOpacity>
          </View>

          {errors.password && touched.password ? (
            <Text style={styles.error}>{errors.password}</Text>
          ) : null}

          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}

          {loading ? (
            <ActivityIndicator
              size="large"
              color="#006400"
              style={styles.loader}
            />
          ) : (
            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </Formik>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: "100%",
    paddingHorizontal: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
    width: "100%",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  passwordInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 10,
  },
  iconContainer: {
    paddingHorizontal: 10,
  },
  error: {
    color: "red",
    marginBottom: 10,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#006400",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loader: {
    marginTop: 20,
  },
  errorMessage: {
    color: "red",
    marginBottom: 10,
    textAlign: "center",
  },
});

export default SignInForm;
