import React, { useState } from "react";
import { Auth } from "aws-amplify";
import CrowdSyncLogo from "../images/Crowdsync_Logo.png";
import styles from "./style";
import { useLog } from "../CrowdSyncLogManager";
import { useNavigate } from "react-router-dom";

const ForgotPasswordScreen = () => {
  const navigation = useNavigate();
  const [username, setUsername] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isCodeSent, setIsCodeSent] = useState(false);
  const log = useLog();

  log.debug("Entering ForgotPasswordScreen...");

  const handleSendCode = async () => {
    log.debug("handleSendCode on username: ", JSON.stringify(username));
    try {
      await Auth.forgotPassword(username);
      setIsCodeSent(true);
    } catch (error) {
      console.error("Forgot password error:", error);
      log.error("Forgot password error:", JSON.stringify(error));
      alert("An error occurred. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    log.debug("handleResetPassword...");
    try {
      await Auth.forgotPasswordSubmit(username, verificationCode, newPassword);
      alert("Password reset successful.");
      // Navigate back to login or wherever you need
      navigation("/");
    } catch (error) {
      console.error("Reset password error:", error);
      log.error("Reset password error:", JSON.stringify(error));
      alert("An error occurred. Please try again.");
    }
  };

  return (
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
        <div style={{ paddingTop: 10, paddingBottom: 10 }}>
          <input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none"
            style={styles.textInput}
            color="#2a2e30"
          />
          <div style={{ marginTop: 20 }} />
          {!isCodeSent ? (
            <button onClick={handleSendCode} style={styles.basicButton}>
              <p style={styles.buttonText}>Send Verification Code</p>
            </button>
          ) : (
            <>
              <input
                placeholder="Verification Code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                style={styles.textInput}
                color="#2a2e30"
              />
              <input
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                color="#2a2e30"
                type="password"
                style={styles.textInput}
              />
              <button onClick={handleResetPassword} style={styles.basicButton}>
                <p style={styles.buttonText}>Reset Password</p>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
