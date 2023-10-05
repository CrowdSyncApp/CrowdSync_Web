import React from "react";
import styles from "./style";
import CrowdSyncLogo from "../images/Crowdsync_Logo.png";

const LoadingScreen = () => {

  return (
    <div style={styles.splash}>
      <div style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <img
          src={CrowdSyncLogo}
          alt="CrowdSyncLogo"
          object-fit="contain"
          style={styles.splashLogo}
        />
        <p style={styles.splashTitle}>Loading...</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
