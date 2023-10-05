import React, { useEffect, useState } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { useAuth } from "../QueryCaching";
import { endSession, fetchParticipants, exitSession } from "./SessionManager";
import { getParticipants } from "../graphql/queries";
import { updateParticipants } from "../graphql/mutations";
import { Participants } from "../API";
import QRCode from "qrcode.react";
import {
  onCreateOrUpdateParticipants,
  onDeleteParticipants,
  onUpdateParticipants,
} from "..//graphql/subscriptions";
import styles from "./style";
import { useLog } from "../CrowdSyncLogManager";
import { useNavigate, useLocation } from "react-router-dom";

const SessionHomeScreen = () => {
  const navigation = useNavigate();
  const authContext = useAuth();
  const location = useLocation();
  const log = useLog();
  const [participants, setParticipants] = useState<Array<Participants>>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isQRCodeModalVisible, setIsQRCodeModalVisible] = useState(false);

  const params = new URLSearchParams(location.search);
  const sessionData = JSON.parse(params.get("sessionData") || "{}");

  const qrCodeData = JSON.stringify({
    sessionId: sessionData.sessionId,
    startTime: sessionData.startTime,
    title: sessionData.title,
    creatorId: sessionData.creatorId,
    status: sessionData.status,
  });

  const handleQRCodePress = () => {
    setIsQRCodeModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsQRCodeModalVisible(false);
  };

  useEffect(() => {
    authContext.refreshLocation(log);

    const fetchData = async () => {
      const storeParticipantData = async () => {
        log.debug("storeParticipantData on user: ", authContext.user);
        // Fetch participant data for the current session
        const participantsList = await fetchParticipants(log);
        log.debug("participantsList: ", participantsList);
        setParticipants(participantsList);
      };
      storeParticipantData();

      // TODO update to remove an extra API call and just get the result from the storeParticipantData call
      const fetchVisibility = async () => {
        log.debug("fetchVisibility");
        const userProfileData = await authContext.fetchUserProfileData();
        if (!userProfileData) {
          setIsVisible(false);
          return;
        }
        try {
          const response: any = await API.graphql({
            query: getParticipants,
            variables: {
              sessionId: sessionData.sessionId,
              userId: userProfileData.userId,
            },
          });

          log.debug("visibility: ", response.data.getParticipants.visibility);
          // Update the visibility state
          setIsVisible(response.data.getParticipants.visibility === "VISIBLE");
        } catch (error) {
          console.error("Error fetching visibility:", error);
          log.error("Error fetching visibility:", JSON.stringify(error));
        }
      };

      fetchVisibility();

      const createOrUpdateSubscription = () => {
        // Create subscription for adding new participants
        log.debug(
          "onCreateOrUpdateParticipants on sessionData: ",
          sessionData.sessionId
        );
        const subscription = (
          API.graphql(
            graphqlOperation(onCreateOrUpdateParticipants, {
              sessionId: sessionData.sessionId,
            })
          ) as Exclude<ReturnType<typeof API.graphql>, Promise<any>>
        ).subscribe({
          next: (response: any) => {
            const newParticipant =
              response.value.data.onCreateOrUpdateParticipants;
            setParticipants((prevParticipants) => [
              ...prevParticipants,
              newParticipant,
            ]);
          },
          error: (error: any) => {
            console.error(
              "Error subscribing to participant created or updated:",
              error
            );
            log.error(
              "Error subscribing to participant created or updated:",
              JSON.stringify(error)
            );
          },
        });
        return subscription;
      };

      const deleteSubscription = () => {
        // Create subscription for deleting participants
        const subscription = (
          API.graphql(
            graphqlOperation(onDeleteParticipants, {
              sessionId: sessionData.sessionId,
            })
          ) as Exclude<ReturnType<typeof API.graphql>, Promise<any>>
        ).subscribe({
          next: (response: any) => {
            const deletedParticipant = response.value.data.onDeleteParticipants;
            setParticipants((prevParticipants) =>
              prevParticipants.filter(
                (participant) =>
                  participant.userId !== deletedParticipant.userId
              )
            );
          },
          error: (error: any) => {
            console.error("Error subscribing to participant deleted:", error);
            log.error(
              "Error subscribing to participant deleted:",
              JSON.stringify(error)
            );
          },
        });
        return subscription;
      };

      const updateSubscription = () => {
        // Create subscription for updating participant visibility
        const subscription = (
          API.graphql(
            graphqlOperation(onUpdateParticipants, {
              sessionId: sessionData.sessionId,
            })
          ) as Exclude<ReturnType<typeof API.graphql>, Promise<any>>
        ).subscribe({
          next: (response: any) => {
            const updatedParticipant = response.value.data.onUpdateParticipants;

            authContext.user?.getUserAttributes((error, attributes) => {
              if (
                updatedParticipant.userId !==
                attributes?.find((attr) => attr.Name === "sub")?.Value
              ) {
                if (
                  updatedParticipant.visibility === "VISIBLE" &&
                  updatedParticipant.userStatus === "ACTIVE"
                ) {
                  setParticipants((prevParticipants) => [
                    ...prevParticipants,
                    updatedParticipant,
                  ]);
                } else {
                  setParticipants((prevParticipants) =>
                    prevParticipants.filter(
                      (participant) =>
                        participant.userId !== updatedParticipant.userId
                    )
                  );
                }
              }
            });
          },
          error: (error: any) => {
            console.error("Error subscribing to participant updated:", error);
            log.error(
              "Error subscribing to participant updated:",
              JSON.stringify(error)
            );
          },
        });
        return subscription;
      };

      const onCreateOrUpdateSubscription = createOrUpdateSubscription();
      const onDeleteSubscription = deleteSubscription();
      const onUpdateSubscription = updateSubscription();

      return () => {
        onCreateOrUpdateSubscription.unsubscribe();
        onDeleteSubscription.unsubscribe();
        onUpdateSubscription.unsubscribe();
      };
    };

    fetchData();
  }, [
    authContext,
    authContext.user,
    authContext.fetchUserProfileData,
    sessionData.sessionId,
    log,
  ]);

  const handleExitSession = async () => {
    log.debug(
      "handleExitSession on sessionData: ",
      JSON.stringify(sessionData)
    );
    try {
      const username = authContext.user?.getUsername() ?? "";
      await exitSession(username, sessionData.sessionId, log);

      navigation("/findsession");
    } catch (error) {
      // Handle the error as needed
      console.error("Error exiting session:", error);
      log.error("Error exiting session:", JSON.stringify(error));
    }
  };

  const handleEndSession = async () => {
    log.debug("handleEndSession on sessionData: ", JSON.stringify(sessionData));
    if (
      sessionData.sessionId === "52caeecf-8b99-463c-9e7c-b5a3168cb08c" ||
      sessionData.sessionId === "f9fc3662-a75e-4d9b-bba3-d28475a707d1" ||
      sessionData.sessionId === "6d377c2c-ec25-4410-bf0f-81d4c99bbfa9"
    ) {
      // Don't end the permanent sessions, TEMP CODE
      await handleExitSession();
      return;
    }
    try {
      const username = authContext.user?.getUsername() ?? "";
      await endSession(
        username,
        sessionData.sessionId,
        sessionData.startTime,
        log
      );

      navigation("/findsession");
    } catch (error) {
      // Handle the error as needed
      console.error("Error ending session:", error);
      log.error("Error ending session:", JSON.stringify(error));
    }
  };

  const handleToggleVisibility = async () => {
    log.debug("handleToggleVisibility");
    try {
      const userProfileData = await authContext.fetchUserProfileData();
      const newVisibility = isVisible ? "INVISIBLE" : "VISIBLE";

      if (!userProfileData) {
        log.error("handleToggleVisibility No user profile found...");
        return;
      }

      log.debug(
        "updateParticipants on sessionId: " +
          JSON.stringify(sessionData.sessionId) +
          " and userId: " +
          JSON.stringify(userProfileData.userId) +
          " and visibility: " +
          JSON.stringify(newVisibility)
      );
      await API.graphql(
        graphqlOperation(updateParticipants, {
          input: {
            sessionId: sessionData.sessionId,
            userId: userProfileData.userId,
            visibility: newVisibility,
          },
        })
      );

      // Update the visibility state
      setIsVisible(!isVisible);
    } catch (error) {
      console.error("Error toggling visibility:", error);
      log.error("Error toggling visibility:", JSON.stringify(error));
    }
  };

  const handleGroupChatPress = async () => {
    const params = {
      participants: JSON.stringify(participants),
      chatType: "GROUP",
    };

    navigation(
      `/chat/${JSON.stringify(new URLSearchParams(params).toString())}`
    );
  };

  const handleUserProfilePress = async (participant: Participants) => {
    log.debug(
      "handleUserProfilePress on participant: " +
        JSON.stringify(participant) +
        " and sessionId: " +
        JSON.stringify(sessionData.sessionId)
    );
    let userData = await authContext.getUserProfileFromId(
      participant.userId,
      log
    );

    const params = {
      userData: JSON.stringify(userData),
      sessionId: JSON.stringify(sessionData.sessionId),
    };

    navigation(`/otheruserprofile/${new URLSearchParams(params).toString()}`);
  };

  const isAdmin = authContext.user
    ?.getSignInUserSession()
    ?.getIdToken()
    ?.payload["cognito:groups"]?.includes("CrowdSync_UserPool_Admin");

  return (
    <div style={styles.index}>
      <div style={styles.div}>
        {/* QR Code */}
        <div onClick={handleQRCodePress}>
          <div style={{ marginBottom: 10, alignItems: "center" }}>
            <QRCode value={qrCodeData} size={200} />
          </div>
        </div>

        <div style={{ alignItems: "center" }}>
          <h1 style={styles.headerTitle}>{sessionData.title}</h1>
        </div>

        <div style={{ flex: 1, width: "100%" }}>
          <h2 style={styles.secondaryHeaderTitle}>Available Profiles:</h2>
          <ul>
            {participants.map((item) => (
              <li
                key={item.userId}
                onClick={() => handleUserProfilePress(item)}
              >
                <div
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingTop: 10,
                    paddingBottom: 10,
                  }}
                >
                  <span style={styles.detailText}>{item.fullName}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div style={styles.flexButtonContainer}>
          <button style={styles.loginButton} onClick={handleToggleVisibility}>
            <span style={styles.buttonText}>
              {isVisible ? "Go Invisible" : "Go Visible"}
            </span>
          </button>
          <button style={styles.loginButton} onClick={handleExitSession}>
            <span style={styles.buttonText}>Exit Session</span>
          </button>
        </div>

        {isAdmin && (
          <div
            style={{ flexDirection: "row", marginBottom: 10, marginTop: 10 }}
          >
            <button style={styles.tertiaryButton} onClick={handleEndSession}>
              <span style={styles.buttonText}>End Session</span>
            </button>
          </div>
        )}

        <div style={{ marginTop: 10 }} />
        <div style={styles.flexButtonContainer}>
          {isVisible && (
            <button style={styles.loginButton} onClick={handleGroupChatPress}>
              <span style={styles.buttonText}>Session Chat</span>
            </button>
          )}
        </div>
        <div
          style={{
            display: isQRCodeModalVisible ? "block" : "none",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              padding: 20,
              backgroundColor: "#fff",
              borderRadius: 10,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <QRCode value={qrCodeData} size={300} />
            <button
              style={{
                marginTop: 20,
                padding: 10,
                backgroundColor: "#ff0000",
                borderRadius: 5,
                color: "#fff",
                border: "none",
                cursor: "pointer",
              }}
              onClick={handleCloseModal}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionHomeScreen;
