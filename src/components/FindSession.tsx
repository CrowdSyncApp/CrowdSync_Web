import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "react-modal";
import { useAuth } from "../QueryCaching";
import {
  startSession,
  removeSessionData,
  createOrUpdateParticipant,
  storeSessionData,
} from "./SessionManager";
import { FlexDirection, Position, fonts, palette } from "./style";
import { useLog } from "../CrowdSyncLogManager";
import LoadingScreen from "./LoadingScreen";
import { SessionData, Location } from "../interfaces";
import { GoogleMap, Marker, LoadScript } from "@react-google-maps/api";

import CreateSessionIcon from "../images/icons/create_session_icon.png";
import CrowdSyncLogo from "../images/CrowdSync_1563 x 1563_White.png";

const FindSessionScreen = () => {
  const navigation = useNavigate();
  const [location, setLocation] = useState<Location | null>();
  const authContext = useAuth();
  const log = useLog();
  const [itemHeights, setItemHeights] = useState<number[]>([]);
  const itemRefs = useRef<HTMLDivElement[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalData, setModalData] = useState({
    title: "General",
  });

  const nearbySessions = [
    {
      title: "Entrepreneur",
      description: "Learn about startups and entrepreneurship",
      tags: ["Entrepreneur", "Founders"],
      sessionId: "52caeecf-8b99-463c-9e7c-b5a3168cb08c",
      startTime: "",
      creatorId: "",
      status: "ACTIVE",
    },
    {
      title: "Cryptocurrency",
      description: "Discuss the world of cryptocurrencies",
      tags: ["Block chain", "Bitcoin"],
      sessionId: "f9fc3662-a75e-4d9b-bba3-d28475a707d1",
      startTime: "",
      creatorId: "",
      status: "ACTIVE",
    },
    {
      title: "Machine Learning",
      description: "Explore machine learning technologies",
      tags: ["AI", "ChatGPT"],
      sessionId: "6d377c2c-ec25-4410-bf0f-81d4c99bbfa9",
      startTime: "",
      creatorId: "",
      status: "ACTIVE",
    },
  ];

  useEffect(() => {
    log.debug("Entering FindSessionScreen screen...");
    removeSessionData(log);

    const requestLocationPermission = async () => {
      try {
        const currLocation = await authContext.refreshLocation(log);
        log.debug("location: ", JSON.stringify(currLocation));
        setLocation(currLocation);
      } catch (error) {
        console.error("Error requesting location permission:", error);
        log.error(
          "Error requesting location permission:",
          JSON.stringify(error)
        );
      }
    };

    requestLocationPermission();

    const locationUpdateInterval = setInterval(async () => {
      try {
        requestLocationPermission();
      } catch (error) {
        console.error("Error refreshing location:", error);
        log.error("Error refreshing location:", JSON.stringify(error));
      }
    }, 3 * 600 * 1000); // 3 minutes

    const storeLocationIntervalId = async () => {
      await authContext.storeInterval(locationUpdateInterval, log);
    };
    storeLocationIntervalId();
  }, [authContext, log]);

  const handleCreateSession = async () => {
    // Toggle the visibility of the modal
    setIsModalVisible(false);
    await handleStartSession();
  };

  const handleCancel = () => {
    // Close the modal and clear the results
    setIsModalVisible(false);
    setModalData({
      title: "General",
    });
  };

  const handleModalInputChange = (field: string, text: string) => {
    // Update the modal data based on the input field
    setModalData({
      ...modalData,
      [field]: text,
    });
  };

  const handleQRCodeScan = () => {
    log.debug("handleQRCodeScan...");
    navigation("QRScanner");
  };

  const handleCreateSessionRequest = () => {
    // Function to handle when the "Create Session" is pressed
    // Define the logic for creating a new session here
    setIsModalVisible(!isModalVisible);
  };

  const handleStartSession = async () => {
    const userProfileData = await authContext.fetchUserProfileData();
    const newSession: SessionData = await startSession(
      userProfileData,
      modalData.title,
      log
    );
    const jsonNewSession = JSON.stringify(newSession);
    log.debug(
      "handleStartSession with userProfileData: " +
        JSON.stringify(userProfileData) +
        " and newSession: " +
        jsonNewSession
    );

    if (newSession) {
      const params = {
        sessionData: jsonNewSession,
      };

      navigation(`/sessionhome/${new URLSearchParams(params).toString()}`);
    }
  };

  const handleNearbySessionPress = async (session: SessionData) => {
    log.debug("handleNearbySessionPress on session: ", session);

    const userProfileData = await authContext.fetchUserProfileData();
    if (!userProfileData) {
      log.error(
        "handleNearbySessionPress Attempted nearby session entry without proper user profile data."
      );
      return;
    }

    const fullName = userProfileData.fullName;

    const userId = userProfileData.userId;
    const sessionId = session.sessionId;
    await createOrUpdateParticipant(userId, fullName, sessionId, log);

    await storeSessionData(session, log);

    const params = {
      sessionData: JSON.stringify(session),
    };

    navigation(
      `/sessionhome/${JSON.stringify(new URLSearchParams(params).toString())}`
    );
  };

  const handleItemLayout = (index: number) => {
    return (node: HTMLDivElement | null) => {
      if (node && !itemRefs.current[index]) {
        itemRefs.current[index] = node;
        const updatedItemHeights = itemRefs.current.map((ref) =>
          ref ? ref.clientHeight : 0
        );
        setItemHeights(updatedItemHeights);
      }
    };
  };

  const renderNearbySessions = () => {
    const handleScroll = (event: any) => {
      console.log("itemHeights: ", itemHeights);
      const { contentOffset, layoutMeasurement } = event.nativeEvent;
      const scrollViewCenterY = contentOffset.y + layoutMeasurement.height / 2;

      let minDistance = Infinity;
      let nearestIndex = -1;

      nearbySessions.forEach((_, index) => {
        const itemLayout =
          index < itemHeights.length
            ? itemHeights
                .slice(0, index)
                .reduce((acc, height) => acc + height, 0)
            : 0;
        const itemCenterY = itemLayout - scrollViewCenterY;
        const distance = Math.abs(scrollViewCenterY - itemCenterY);

        if (distance < minDistance) {
          minDistance = distance;
          nearestIndex = index;
        }
      });

      console.log("nearestIndex: ", nearestIndex);
    };

    return (
      <div onScroll={handleScroll} style={overlayStyles.scrollViewContent}>
        <div style={{ marginBottom: -10 }}>
          {nearbySessions.map((session, index) => (
            <div key={index} onClick={() => handleNearbySessionPress(session)}>
              <div style={overlayStyles.nearbySessionContainer}>
                <div style={overlayStyles.sessionInfoContainer}>
                  <h3 style={overlayStyles.sessionTitle}>{session.title}</h3>
                  <p style={overlayStyles.sessionDescription}>
                    {session.description}
                  </p>
                </div>
                <div style={overlayStyles.sessionDetailsContainer}>
                  <div style={overlayStyles.sessionDetailSection}>
                    <p style={overlayStyles.sessionDetailText}>
                      Your Connections:
                    </p>
                    <p style={overlayStyles.sessionDetailText}>
                      Jane Smith, Emily Brown, Michael Wilson
                    </p>
                  </div>
                  <div style={overlayStyles.sessionDetailSection}>
                    <p style={overlayStyles.sessionDetailText}>
                      Compatibility:
                    </p>
                    <p style={overlayStyles.sessionDetailText}>90%</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: "flex" }}>
      <div style={overlayStyles.leftSection}>
        <div style={overlayStyles.leftSectionHeader}>
          <div>
            <p>PROFILE</p>
          </div>
          <img
            src={CrowdSyncLogo}
            alt="CrowdSync Logo"
            style={{ height: "100%", width: "auto" }}
          />
          <div style={overlayStyles.circleContainer}>
            <button onClick={handleCreateSessionRequest}>
              <img
                src={CreateSessionIcon}
                object-fit="cover"
                alt="Create Session Icon"
                style={overlayStyles.createSessionIcon}
              />
            </button>
          </div>
        </div>
        <h2 style={overlayStyles.tertiaryHeaderTitle}>Nearby Sessions</h2>
        {renderNearbySessions()}
      </div>
      {location ? (
        <LoadScript googleMapsApiKey="AIzaSyDpQkIQ690BaoZdhOTypPfrWl7rruN2Srs">
          <GoogleMap
            mapContainerStyle={{ height: "100vh" }}
            center={{ lat: location.latitude, lng: location.longitude }}
            zoom={17}
          >
            {location && (
              <Marker
                position={{ lat: location.latitude, lng: location.longitude }}
                title="Your location"
              />
            )}
          </GoogleMap>
        </LoadScript>
      ) : (
        <LoadingScreen />
      )}
      <Modal
        isOpen={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
        className="modal"
        overlayClassName="modal-overlay"
        contentLabel="Create Session Modal"
      >
        <div className="modal-content">
          <input
            className="modal-input"
            placeholder="Title"
            onChange={(e) => handleModalInputChange("title", e.target.value)}
            value={modalData.title}
            style={{ color: "black" }}
          />
          <div className="modal-buttons">
            <button onClick={handleCancel} className="modal-button">
              Cancel
            </button>
            <button onClick={handleCreateSession} className="modal-button">
              Create Session
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const overlayStyles = {
  leftSectionHeader: {
    display: "flex",
    alignItems: "center",
    flexDirection: "row" as FlexDirection,
    justifyContent: "space-between",
    backgroundColor: palette.primaryBgColor,
    height: "150px",
  },
  leftSection: {
    flex: 1,
    maxWidth: "33.33%",
    backgroundColor: palette.secondaryColor,
  },
  searchInput: {
    flex: 1,
    color: "black",
  },
  tertiaryHeaderTitle: {
    fontFamily: fonts.baseFontFamily,
    display: "flex",
    justifyContent: "center",
    fontSize: 30,
    fontWeight: "300",
    color: "white",
  },
  searchIcon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  qrCodeIcon: {
    width: 20,
    height: 20,
  },
  buttonContainer: {
    position: "absolute" as Position,
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 10,
    padding: 10,
    maxHeight: 200,
    overflow: "hidden",
  },
  scrollViewContent: {
    paddingTop: 20,
  },
  nearbySessionContainer: {
    backgroundColor: "white",
    borderRadius: 10,
    marginBottom: 10,
    marginLeft: 10,
    marginRight: 10,
    padding: 10,
    display: "flex",
    flexDirection: "row" as FlexDirection,
    justifyContent: "space-between",
    flex: 1,
  },
  sessionInfoContainer: {
    flex: 1,
    marginRight: 10,
  },
  sessionDetailsContainer: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "black",
  },
  sessionDescription: {
    fontSize: 14,
    color: "black",
  },
  sessionDetailSection: {
    marginBottom: 10,
  },
  sessionDetailText: {
    color: "black",
  },
  topLeftButtonContainer: {
    position: "absolute" as Position,
    top: 20,
    left: 20,
  },
  iconButton: {
    width: 40,
    height: 40,
    tintColor: "black",
  },
  menuContainer: {
    position: "absolute" as Position,
    top: 80,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
  },
  menuItem: {
    flexDirection: "row" as FlexDirection,
    alignItems: "center",
    padding: 10,
  },
  menuIcon: {
    width: 20,
    height: 20,
  },
  menuText: {
    color: "black",
    fontSize: 16,
  },
  searchResultsContainer: {
    position: "absolute" as Position,
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
    maxHeight: 150,
    overflow: "hidden",
  },
  searchResultText: {
    padding: 10,
    fontSize: 16,
    color: "black",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalInput: {
    width: "100%",
    borderBottomWidth: 1,
    borderColor: "black",
    marginVertical: 10,
    padding: 10,
    color: "black",
  },
  modalButtons: {
    flexDirection: "row" as FlexDirection,
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  modalButtonText: {
    color: "black",
    fontSize: 16,
  },
  topRightContainer: {
    top: 20,
    right: 20,
    flexDirection: "row" as FlexDirection,
  },
  circleContainer: {
    width: 65,
    height: 65,
    borderRadius: "50%",
    backgroundColor: "white",
    marginLeft: 5,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  createSessionIcon: {
    width: "100%",
    height: "100%",
  },
};

export default FindSessionScreen;
