import React, { useState, useEffect } from "react";
import { getSessionData, getParticipantVisibility } from "./SessionManager";
import styles from "./style";
import { useAuth } from "../QueryCaching";
import { useLog } from "../CrowdSyncLogManager";
import { useLocation, useNavigate } from "react-router-dom";
import { Tag } from "../interfaces";

const OtherUserProfileScreen = () => {
  const authContext = useAuth();
  const location = useLocation();
  const navigation = useNavigate();
  const [profilePictureUri, setProfilePictureUri] = useState("");
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const log = useLog();

  const params = new URLSearchParams(location.search);
  const userData = JSON.parse(params.get("userData") || "{}");
  const sessionId = JSON.parse(params.get("sessionId") || "{}");

  log.debug(
    "OtherUserProfileScreen on userData: " +
      JSON.stringify(userData) +
      " and sessionId: " +
      JSON.stringify(sessionId)
  );

  const [showLocationButton, setShowLocationButton] = useState(false);
  const [visible, setVisible] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      async function getProfileImageUri() {
        let profilePicture;
        if (
          userData.userId === "1" ||
          userData.userId === "2" ||
          userData.userId === "3" ||
          userData.userId === "4" ||
          userData.userId === "5"
        ) {
          profilePicture = userData.profilePicture;
        } else {
          profilePicture = await authContext.fetchUserProfileImage(
            userData.identityId,
            userData.profilePicture,
            log
          );
        }
        log.debug(
          "getProfileImageUri results: ",
          JSON.stringify(profilePicture)
        );
        setProfilePictureUri(profilePicture);
      }

      async function getVisibility() {
        let visible;
        if (
          userData.userId === "1" ||
          userData.userId === "2" ||
          userData.userId === "3" ||
          userData.userId === "4" ||
          userData.userId === "5"
        ) {
          visible = true;
          if (userData.userId === "3") {
            visible = false;
          }
        } else {
          visible = await getParticipantVisibility(
            userData.userId,
            sessionId,
            log
          );
        }
        log.debug("getVisibility results: ", JSON.stringify(visible));
        setVisible(visible ?? false);
      }

      async function getUserTags() {
        const allUserTags = await authContext.getAllUserTags(
          userData.userId,
          log
        );
        log.debug("userTags retrieved: ", JSON.stringify(allUserTags));
        setUserTags(allUserTags);
      }

      async function checkShouldShowLocation() {
        log.debug("checkShouldShowLocation...");
        try {
          const currentUserSessionData = await getSessionData(log);
          log.debug(
            "currentUserSessionData: ",
            JSON.stringify(currentUserSessionData)
          );
          if (
            sessionId === currentUserSessionData.sessionId &&
            sessionId !== "INACTIVE"
          ) {
            setShowLocationButton(true);
            log.debug("showLocationButton is true");
          } else {
            setShowLocationButton(false);
            log.debug("showLocationButton is false");
          }
        } catch (error) {
          console.error("Error fetching current user's sessionId:", error);
          log.error(
            "Error fetching current user's sessionId:",
            JSON.stringify(error)
          );
          setShowLocationButton(false); // Handle the error by not showing the button
        }
      }

      await getUserTags();
      await getVisibility();
      await getProfileImageUri();
      await checkShouldShowLocation();
    };

    fetchData();
  }, [
    userData.userId,
    sessionId,
    userData.profilePicture,
    userData.identityId,
    log,
    authContext,
  ]);

  const handleLinkPress = (url: string) => {
    log.debug("handleLinkPress on url: ", JSON.stringify(url));

    if (url) {
      // Check if the environment is web (browser)
      if (typeof window !== "undefined" && window.open) {
        window.open(url, "_blank");
      } else {
        // Handle non-web environment (e.g., React Native)
        log.error("Cannot open URL. Unsupported environment.");
      }
    }
  };

  const renderSocialLinks = (socialLinks: string[]) => {
    if (socialLinks && socialLinks.length > 0) {
      return socialLinks.map((link: string, index: number) => (
        <button key={index} onClick={() => handleLinkPress(link)}>
          <p style={styles.detailText}>{link}</p>
        </button>
      ));
    } else {
      return <p style={styles.detailText}>No social links available.</p>;
    }
  };

  // Function to handle opening the chat (you can implement your chat logic here)
  const handleChatPress = () => {
    log.debug(
      "handleChatPress on participants: " +
        JSON.stringify([userData]) +
        " and chatType: INDIVIDUAL"
    );

    const params = {
      participants: JSON.stringify([userData]),
      chatType: "INDIVIDUAL",
    };

    navigation(
      `/chat/${JSON.stringify(new URLSearchParams(params).toString())}`
    );
  };

  const handleLocationPress = () => {
    log.debug(
      "handleLocationPress on userData: " +
        JSON.stringify(userData) +
        " and sessionId: " +
        JSON.stringify(sessionId)
    );

    const params = {
      userData: JSON.stringify(userData),
      sessionId: sessionId,
    };

    navigation(
      `/userlocation/${JSON.stringify(new URLSearchParams(params).toString())}`
    );
  };

  return (
    <div style={{ flexGrow: 1 }}>
      <div style={styles.index}>
        <div style={styles.div}>
          {/* Profile Picture */}
          {profilePictureUri !== "" ? (
            <img
              src={profilePictureUri}
              alt="Profile"
              object-fit="cover"
              style={{
                width: 350,
                height: 350,
                borderRadius: 100,
              }}
            />
          ) : (
            <div style={{ width: 350, height: 350 }} />
          )}

          {/* User's Name */}
          <div style={{ alignItems: "center" }}>
            <h1 style={styles.headerTitle}>{userData.fullName}</h1>
          </div>

          {/* Job Title and Company */}
          {userData.jobTitle || userData.company ? (
            <div style={{ alignItems: "center" }}>
              <h2 style={styles.secondaryHeaderTitle}>
                {userData.jobTitle}
                {userData.jobTitle && userData.company ? ", " : ""}
                {userData.company}
              </h2>
            </div>
          ) : null}

          {/* Location and Phone Number */}
          {userData.jobTitle || userData.company ? (
            <div style={{ alignItems: "center" }}>
              <h2 style={styles.secondaryHeaderTitle}>
                {userData.location}
                {userData.location && userData.phoneNumber ? ", " : ""}
                {userData.phoneNumber}
              </h2>
            </div>
          ) : null}

          {/* Social URLs */}
          <div>
            <h2 style={styles.secondaryHeaderTitle}>Social Links:</h2>
            {renderSocialLinks(userData.socialLinks)}
          </div>

          {/* User's Tags */}
          <div>
            <h2 style={styles.secondaryHeaderTitle}>My Tags:</h2>
            <p style={styles.detailText}>
              {userTags && userTags.length > 0
                ? userTags.map((tag, index) =>
                    index === userTags.length - 1 ? tag.tag : tag.tag + ", "
                  )
                : "No tags available."}
            </p>
          </div>

          {/* Chat Button */}
          <div style={{ paddingTop: 10, paddingBottom: 10 }} />
          <button style={styles.basicButton} onClick={handleChatPress}>
            <p style={styles.buttonText}>Chat</p>
          </button>

          {showLocationButton && visible && (
            <div style={{ paddingTop: 10, paddingBottom: 10 }}>
              <button style={styles.basicButton} onClick={handleLocationPress}>
                <p style={styles.buttonText}>Location</p>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OtherUserProfileScreen;
