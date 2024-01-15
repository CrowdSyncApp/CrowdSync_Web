import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CrowdSyncLogo from "../images/Crowdsync_Logo.png";
import styles from "./style";
import { useLog } from "../CrowdSyncLogManager";

const QueryScreen = () => {
  const [user_url, setUserUrl] = useState("");
  const [event_name, setEventName] = useState("");
  const navigation = useNavigate();
  const log = useLog();

  const handleSubmit = () => {
    // Navigate to the SignUp screen
    navigation("/results");
  };

  return (
    <div style={styles.index}>
      <div style={styles.div}>
        <div style={{ backgroundColor: "#f0f0f0" }}>
          <div style={styles.titleContainer}>
            <img
              src={CrowdSyncLogo}
              alt="CrowdSync Logo"
              style={styles.splashLogo}
            />
            <div style={{ marginTop: 20 }} />
            <span style={styles.splashTitle}>CrowdSync</span>
          </div>
          <div style={{ marginTop: 30 }}>
            <input
              id="user_url"
              type="text"
              placeholder="LinkedIn User URL"
              value={user_url}
              onChange={(e) => setUserUrl(e.target.value)}
              style={styles.textInput}
            />
          </div>
          <div style={{ paddingTop: 20, paddingBottom: 20 }}>
            <input
              id="event"
              type="text"
              placeholder="Event"
              value={event_name}
              onChange={(e) => setEventName(e.target.value)}
              style={styles.textInput}
            />
          </div>
          <div
            style={{
              paddingTop: 10,
              paddingBottom: 10,
              paddingLeft: 13,
              paddingRight: 13,
            }}
          >
            <button onClick={handleSubmit} style={styles.tertiaryButton}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueryScreen;
