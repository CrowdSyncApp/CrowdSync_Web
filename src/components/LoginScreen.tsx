import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CrowdSyncLogo from "../images/Crowdsync_Logo.png";
import styles from "./style";
import { useAuth } from "../QueryCaching";
import { useLog } from "../CrowdSyncLogManager";

const LoginScreen = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigate();
  const authContext = useAuth();
  const log = useLog();

  const handleLogin = async () => {
    try {
        log.debug('Attempted login on username: ', JSON.stringify(username));
      await authContext.login({ username, password }, log);
      navigation("/findsession");
    } catch (error) {
    log.debug('Failed login: ', JSON.stringify(error));
      throw error;
    }
  };

  const handleGuestSignIn = async () => {
    log.debug('handleGuestSignIn');
    try {
      log.debug('Logging in with guest account hello@crowdync.net');
      await authContext.login({ username: 'hello@crowdsync.net', password: 'CrowdsyncGuest1' }, log);

      // Navigate to the FindSession screen or any other desired screen
      navigation("/findsession");
    } catch (error) {
      console.error("Guest Sign In error:", error);
      log.error("Guest Sign In error:", JSON.stringify(error));
      alert("Guest Sign In failed. Please try again.");
    }
  };

  const handleSignUp = () => {
    // Navigate to the SignUp screen
    navigation("/signup");
  };

  const handleForgotPassword = () => {
    // Navigate to the ForgotPassword screen
    navigation("/forgotpassword");
  };

  return (
    <div style={styles.index}>
      <div style={styles.div}>
        <div style={{ backgroundColor: "#f0f0f0" }}>
          <div style={styles.titleContainer}>
            <img src={CrowdSyncLogo} alt="CrowdSync Logo" style={styles.splashLogo} />
            <div style={{ marginTop: 20 }} />
            <span style={styles.splashTitle}>CrowdSync</span>
          </div>
          <div style={{ marginTop: 30 }}>
            <input
              id="login_input"
              type="text"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.textInput}
            />
          </div>
          <div style={{ paddingTop: 20, paddingBottom: 20 }}>
            <input
              id="password_input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.textInput}
            />
          </div>
          <div style={{ marginTop: 10 }} />
          <div style={styles.flexButtonContainer}>
            <button onClick={handleLogin} style={styles.loginButton}>
              Log In
            </button>
            <button onClick={handleSignUp} style={styles.signUpButton}>
              Sign Up
            </button>
          </div>
          <div style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 13, paddingRight: 13 }}>
            <button onClick={handleGuestSignIn} style={styles.tertiaryButton}>
              Guest Sign In
            </button>
          </div>
          <button onClick={handleForgotPassword} style={{ textAlign: "center", marginTop: 20 }}>
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
