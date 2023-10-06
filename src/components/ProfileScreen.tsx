// ProfileScreen.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../QueryCaching";
import styles from "./style";
import { useLog } from "../CrowdSyncLogManager";
import { useParams, useNavigate } from "react-router-dom";
import { Tag } from "../interfaces";

const ProfileScreen = () => {
  const authContext = useAuth();
  const navigation = useNavigate();
  const [profilePictureUri, setProfilePictureUri] = useState("");
  const log = useLog();

  const { userprofiledata } = useParams();
  const parsedUserprofiledata = JSON.parse(userprofiledata ?? "{}");

  useEffect(() => {
    const fetchData = async () => {
      async function getProfileImageUri() {
        const profilePicture = await authContext.fetchUserProfileImage(
          parsedUserprofiledata.identityId,
          parsedUserprofiledata.profilePicture,
          log
        );
        log.debug(
          "getProfileImageUri results: ",
          JSON.stringify(profilePicture)
        );
        setProfilePictureUri(profilePicture);
      }

      await getProfileImageUri();
    };

    fetchData();
  }, [
    parsedUserprofiledata.identityId,
    parsedUserprofiledata.profilePicture,
    authContext,
    log,
  ]);

  const handleLogout = () => {
    log.debug("Logging out and navigating to Login screen...");
    authContext.logout(log);
    navigation("/");
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

  const handleMyConnectionsPress = () => {
    log.debug(
      "handleMyConnectionsPress on userProfileData: ",
      JSON.stringify(parsedUserprofiledata)
    );

    const userProfileDataParam = encodeURIComponent(
      JSON.stringify(parsedUserprofiledata)
    );
    navigation(`/chat/${userProfileDataParam}`);
  };

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

          {/* Full Name */}
          <div style={{ alignItems: "center" }}>
            <h1 style={styles.headerTitle}>{parsedUserprofiledata.fullName}</h1>
          </div>

          {/* Job Title and Company */}
          {parsedUserprofiledata.jobTitle || parsedUserprofiledata.company ? (
            <div style={{ alignItems: "center" }}>
              <h2 style={styles.secondaryHeaderTitle}>
                {parsedUserprofiledata.jobTitle}
                {parsedUserprofiledata.jobTitle && parsedUserprofiledata.company
                  ? ", "
                  : ""}
                {parsedUserprofiledata.company}
              </h2>
            </div>
          ) : null}

          {/* Location and Phone Number */}
          {parsedUserprofiledata.jobTitle || parsedUserprofiledata.company ? (
            <div style={{ alignItems: "center" }}>
              <h2 style={styles.secondaryHeaderTitle}>
                {parsedUserprofiledata.location}
                {parsedUserprofiledata.location &&
                parsedUserprofiledata.phoneNumber
                  ? ", "
                  : ""}
                {parsedUserprofiledata.phoneNumber}
              </h2>
            </div>
          ) : null}

          {/* Render Social Links */}
          <div>
            <h2 style={styles.secondaryHeaderTitle}>Social Links:</h2>
            {renderSocialLinks(parsedUserprofiledata.socialLinks)}
          </div>

          {/* My Tags */}
          <div>
            <h2 style={styles.secondaryHeaderTitle}>My Tags:</h2>
            <p style={styles.detailText}>
              {parsedUserprofiledata.tags &&
              parsedUserprofiledata.tags.length > 0
                ? parsedUserprofiledata.tags.map((tag: Tag, index: number) =>
                    index === parsedUserprofiledata.tags.length - 1
                      ? tag.tag
                      : tag.tag + ", "
                  )
                : "No tags available."}
            </p>
          </div>

          <div style={styles.buttonContainer}>
            <button
              style={styles.basicButton}
              onClick={handleMyConnectionsPress}
            >
              <p style={styles.buttonText}>My Connections</p>
            </button>
            <div style={{ paddingTop: 10, paddingBottom: 10 }} />

            <button style={styles.basicButton} onClick={handleLogout}>
              <p style={styles.buttonText}>Log Out</p>
            </button>
            <div style={{ paddingTop: 10, paddingBottom: 10 }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
