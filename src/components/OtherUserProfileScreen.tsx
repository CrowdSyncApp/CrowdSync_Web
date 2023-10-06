import React, { useState, useEffect } from "react";
import { getSessionData, getParticipantVisibility } from "./SessionManager";
import styles from "./style";
import { useAuth } from "../QueryCaching";
import { useLog } from "../CrowdSyncLogManager";
import { useParams, useNavigate } from "react-router-dom";
import { Tag } from "../interfaces";

const OtherUserProfileScreen = () => {
  const authContext = useAuth();
  const navigation = useNavigate();
  const [profilePictureUri, setProfilePictureUri] = useState("");
  const [userTags, setUserTags] = useState<Tag[]>([]);
  const log = useLog();

  const { userData, sessionId } = useParams();
  const parsedUserData = JSON.parse(userData ?? "{}");

  log.debug(
    "OtherUserProfileScreen on userData: " +
      JSON.stringify(parsedUserData) +
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
          parsedUserData.userId === "1" ||
          parsedUserData.userId === "2" ||
          parsedUserData.userId === "3" ||
          parsedUserData.userId === "4" ||
          parsedUserData.userId === "5"
        ) {
          profilePicture = parsedUserData.profilePicture;
        } else {
          profilePicture = await authContext.fetchUserProfileImage(
            parsedUserData.identityId,
            parsedUserData.profilePicture,
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
          parsedUserData.userId === "1" ||
          parsedUserData.userId === "2" ||
          parsedUserData.userId === "3" ||
          parsedUserData.userId === "4" ||
          parsedUserData.userId === "5"
        ) {
          visible = true;
          if (parsedUserData.userId === "3") {
            visible = false;
          }
        } else {
          visible = await getParticipantVisibility(
            parsedUserData.userId,
            sessionId ?? "INACTIVE",
            log
          );
        }
        log.debug("getVisibility results: ", JSON.stringify(visible));
        setVisible(visible ?? false);
      }

      async function getUserTags() {
        const allUserTags = await authContext.getAllUserTags(
          parsedUserData.userId,
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
          setShowLocationButton(false);
        }
      }

      await getUserTags();
      await getVisibility();
      await getProfileImageUri();
      await checkShouldShowLocation();
    };

    fetchData();
  }, [
    parsedUserData.userId,
    sessionId,
    parsedUserData.profilePicture,
    parsedUserData.identityId,
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
        JSON.stringify([parsedUserData]) +
        " and chatType: INDIVIDUAL"
    );

    const participantsParam = encodeURIComponent(
      JSON.stringify([parsedUserData])
    );
    const chatTypeParam = encodeURIComponent("INDIVIDUAL");
    navigation(`/chat/${participantsParam}/${chatTypeParam}`);
  };

  const handleLocationPress = () => {
    log.debug(
      "handleLocationPress on userData: " +
        JSON.stringify(parsedUserData) +
        " and sessionId: " +
        JSON.stringify(sessionId)
    );

    const userDataParam = encodeURIComponent(JSON.stringify(parsedUserData));
    const sessionIdParam = encodeURIComponent(sessionId ?? "INACTIVE");
    navigation(`/userlocation/${userDataParam}/${sessionIdParam}`);
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
            <h1 style={styles.headerTitle}>{parsedUserData.fullName}</h1>
          </div>

          {/* Job Title and Company */}
          {parsedUserData.jobTitle || parsedUserData.company ? (
            <div style={{ alignItems: "center" }}>
              <h2 style={styles.secondaryHeaderTitle}>
                {parsedUserData.jobTitle}
                {parsedUserData.jobTitle && parsedUserData.company ? ", " : ""}
                {parsedUserData.company}
              </h2>
            </div>
          ) : null}

          {/* Location and Phone Number */}
          {parsedUserData.jobTitle || parsedUserData.company ? (
            <div style={{ alignItems: "center" }}>
              <h2 style={styles.secondaryHeaderTitle}>
                {parsedUserData.location}
                {parsedUserData.location && parsedUserData.phoneNumber
                  ? ", "
                  : ""}
                {parsedUserData.phoneNumber}
              </h2>
            </div>
          ) : null}

          {/* Social URLs */}
          <div>
            <h2 style={styles.secondaryHeaderTitle}>Social Links:</h2>
            {renderSocialLinks(parsedUserData.socialLinks)}
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
