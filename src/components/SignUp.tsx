import React, { useState } from "react";
import { Auth, API, graphqlOperation } from "aws-amplify";
import { createUserProfiles } from "../graphql/mutations";
import CrowdSyncLogo from "../images/Crowdsync_Logo.png";
import styles from "./style";
import { useLog } from "../CrowdSyncLogManager";
import { useNavigate } from "react-router-dom";

const SignUpScreen = () => {
  const navigation = useNavigate();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const log = useLog();
  const [errorMessage, setErrorMessage] = useState("");

  log.debug("SignUpScreen...");

  const handleSignUp = async () => {
    log.debug("handleSignUp...");
    try {
      // Perform sign-up logic
      const user = await Auth.signUp({
        username: username, // Use the chosen username (either email or phone number)
        password: password,
      });

      const now = new Date().toISOString();

      // Create the user profile in DynamoDB using the API
      const userProfileInput = {
        userId: user.userSub,
        fullName: fullName,
        email: isEmailFormat(username) ? username : "",
        phoneNumber: isEmailFormat(username) ? null : username,
        createdAt: now,
        updatedAt: now,
      };

      log.debug("userProfileInput: ", JSON.stringify(userProfileInput));

      try {
        await API.graphql(
          graphqlOperation(createUserProfiles, { input: userProfileInput })
        );
      } catch (error) {
        console.error("Error storing data:", error);
        log.error("Error storing data:", JSON.stringify(error));
      }

      navigation("/");
    } catch (error: any) {
      console.error("Sign up error:", error);
      log.error("Sign up error:", JSON.stringify(error));
      if (error.code === "UsernameExistsException") {
        setErrorMessage(
          "Username already exists. Please choose a different email or phone number."
        );
      } else {
        setErrorMessage(
          "An error occurred during sign up. Please try again later."
        );
      }
    }
  };

  const isEmailFormat = (value: string) => {
    // Simple email format validation
    return /\S+@\S+\.\S+/.test(value);
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setErrorMessage("");
  };

  const handleLoginRedirect = () => {
    // Navigate to the Login screen
    navigation("/");
  };

  return (
    <div style={{ flexGrow: 1 }}>
      <div style={styles.index}>
        <div style={styles.div}>
          <div style={styles.titleContainer}>
            <img
              src={CrowdSyncLogo}
              alt="CrowdSync Logo"
              object-fit="cover"
              style={styles.splashLogo}
            />
            <h1 style={styles.headerTitle}>CrowdSync</h1>
          </div>
          <div
            style={{
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 13,
              paddingRight: 13,
            }}
          >
            <input
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={styles.textInput}
              color="#2a2e30"
            />
            <div style={{ paddingTop: 10, paddingBottom: 10 }} />
            <input
              placeholder="Email"
              color="#2a2e30"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              style={styles.textInput}
            />
            <div style={{ paddingTop: 10, paddingBottom: 10 }} />
            <input
              placeholder="Password"
              color="#2a2e30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              style={styles.textInput}
            />
            <div style={{ paddingTop: 10, paddingBottom: 10 }} />
            <input
              placeholder="Confirm Password"
              color="#2a2e30"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              style={styles.textInput}
            />
          </div>
          <p style={{ color: "red" }}>{errorMessage}</p>
          <div style={styles.buttonContainer}>
            <button style={styles.basicButton} onClick={handleSignUp}>
              <p style={styles.buttonText}>Sign Up</p>
            </button>
            <div style={{ paddingTop: 10, paddingBottom: 10 }} />

            <button style={styles.basicButton} onClick={handleLoginRedirect}>
              <p style={styles.buttonText}>Log In With Existing Account</p>
            </button>
            <div style={{ paddingTop: 10, paddingBottom: 10 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;
