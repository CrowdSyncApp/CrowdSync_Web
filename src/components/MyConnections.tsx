import React, { useEffect, useState } from "react";
import { useAuth } from "../QueryCaching";
import participantsData from "../dummies/dummy_accounts.json";
import { getSessionIdForUser } from "./SessionManager";
import styles from "./style";
import { useLog } from "../CrowdSyncLogManager";
import { useLocation, useNavigate } from "react-router-dom";
import { UserProfiles } from "../API";

const MyConnections = () => {
  const location = useLocation();
  const navigation = useNavigate();
  const authContext = useAuth();
  const [connectionsData, setConnectionsData] = useState<UserProfiles[]>([]);
  const log = useLog();
  const typedParticipantsData: UserProfiles[] =
    participantsData as UserProfiles[];

  const params = new URLSearchParams(location.search);
  const userProfileData = JSON.parse(params.get("userprofiledata") || "{}");

  log.debug(
    "MyConnections screen on userProfileData: ",
    JSON.stringify(userProfileData)
  );

  useEffect(() => {
    const getConnections = async () => {
      const profiles =
        (await authContext.fetchConnectionsAndProfiles(
          userProfileData.userId,
          log
        )) ?? [];
      log.debug("getConnections profiles: ", profiles);
      const mergedData = [...typedParticipantsData, ...profiles];
      log.debug("mergedData: ", mergedData);
      setConnectionsData(mergedData);
    };
    getConnections();
  }, [userProfileData.userId, typedParticipantsData, authContext, log]);

  const handleConnectionPress = async (connectionData: UserProfiles) => {
    log.debug(
      "handleConnectionPress on connectionData: ",
      JSON.stringify(connectionData)
    );
    try {
      const userData = await authContext.getUserProfileFromId(
        connectionData.userId,
        log
      );
      const sessionId = await getSessionIdForUser(connectionData.userId, log);

      log.debug(
        "Navigating to OtherUserProfile on userData: " +
          JSON.stringify(userData) +
          " and sessionId: " +
          JSON.stringify(sessionId)
      );

      const params = {
        userData: JSON.stringify(userData),
        sessionId: JSON.stringify(sessionId),
      };

      navigation(`/otheruserprofile/${new URLSearchParams(params).toString()}`);
    } catch (error) {
      console.error("Error in handleConnectionPress:", error);
      log.error("Error in handleConnectionPress:", JSON.stringify(error));
    }
  };

  return (
    <div style={styles.index}>
      <div style={styles.div}>
        {/* List of Connections */}
        <ul>
          {connectionsData.map((item) => (
            <li key={item.userId}>
              <button onClick={() => handleConnectionPress(item)}>
                <div
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingTop: 10,
                    paddingBottom: 10,
                  }}
                >
                  <h2 style={styles.secondaryHeaderTitle}>{item.fullName}</h2>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default MyConnections;
