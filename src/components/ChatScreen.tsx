import React, { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createChats } from "../graphql/mutations";
import { listChats } from "../graphql/queries";
import { onCreateChats } from "../graphql/subscriptions";
import "react-native-get-random-values";
import { useAuth } from "../QueryCaching";
import styles from "./style";
import { useLog } from "../CrowdSyncLogManager";
import { getSessionData } from "./SessionManager";
import { useParams } from "react-router-dom";
import { Participants, Chats } from "../API";

const ChatScreen = () => {
  const [messages, setMessages] = useState<Chats[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState("");
  const [recIds, setRecIds] = useState([]);
  const authContext = useAuth();
  const log = useLog();

  const { participants, chatType } = useParams();
  const parsedParticipants = JSON.parse(participants ?? "{[]}");

  const fakeChats = [
    "Hey everyone! I just got to the event",
    "Where's everyone standing? I'm in Building B by the water fountain",
    "I'm looking forward to the next speaker in 15 minutes!",
    "Heading to a different session now - nice chatting with you all!",
    "Hi, where can I find the session on Web3?",
  ];

  log.debug(
    "Entering ChatScreen with participants: " +
      JSON.stringify(parsedParticipants) +
      " and chatType: " +
      JSON.stringify(chatType)
  );

  useEffect(() => {
    async function setIdReceiverAndParticipantsList() {
      let id;
      let receiver;

      log.debug("senderId: ", JSON.stringify(authContext.user?.getUsername()));
      log.debug("participantsList: ", JSON.stringify(parsedParticipants));
      let participantIds = parsedParticipants.map(
        (participant: Participants) => participant.userId
      );

      if (chatType === "GROUP") {
        const sessionData = await getSessionData(log);
        log.debug("Creating chatId with sessionData: ", sessionData);
        id = sessionData.sessionId + sessionData.creatorId;
        receiver = participantIds;
      } else {
        const userList: string[] = [
          authContext.user?.getUsername(),
          parsedParticipants[0].userId,
        ];
        userList.sort(); // Sort the user IDs

        log.debug("Creating chatId with userList: ", userList);

        // Combine the sorted user IDs
        id = userList[0] + userList[1];
        receiver = [parsedParticipants[0].userId];
      }
      log.debug("chatId: ", JSON.stringify(id));
      log.debug("ReceiverIds: ", JSON.stringify(receiver));
      setChatId(id);
      setRecIds(receiver);
    }

    setIdReceiverAndParticipantsList();
  }, [log, chatType, authContext.user]);

  useEffect(() => {
    log.debug(
      "Subscribing to onCreateChats with chatId: ",
      JSON.stringify(chatId)
    );
    const subscription = (
      API.graphql(
        graphqlOperation(onCreateChats, {
          chatId: chatId,
        })
      ) as Exclude<ReturnType<typeof API.graphql>, Promise<any>>
    ).subscribe({
      next: (data: any) => {
        // Handle incoming subscription data (new chat messages)
        const newChatMessage = data.value.data.onCreateChats;
        log.debug("newChatMessage: ", JSON.stringify(newChatMessage));

        setMessages((prevMessages) => [...prevMessages, newChatMessage]);
      },
      error: (error: any) => {
        console.error("Subscription error:", error);
        log.error("Subscription error:", JSON.stringify(error));
      },
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [chatId, log]);

  const renderChatBubble = (item: Chats, isUser: Boolean) => {
    const chatBubbleStyle = {
      backgroundColor: isUser ? "#DCF8C6" : "#F0F0F0",
      alignSelf: isUser ? "flex-end" : "flex-start",
      padding: 10,
      borderRadius: 10,
      marginBottom: 10,
    };

    console.log("item", JSON.stringify(item));

    const textStyle = {
      color: isUser ? "#000" : "#000",
    };

    return (
      <div style={chatBubbleStyle}>
        <p style={styles.detailText}>{item.senderName}</p>
        <p style={textStyle}>{item.messageContent}</p>
        <p style={styles.detailText}>{formatTimestamp(item.timestamp)}</p>
      </div>
    );
  };

  // Function to handle sending a new message
  const handleSend = async () => {
    log.debug("handleSend...");
    if (newMessage.trim() !== "") {
      const now = new Date().toISOString();

      try {
        const chatTypeStatus = `${chatType}#ACTIVE`;
        const senderName = await authContext.getUserProfileFromId(
          authContext.user?.getUsername() ?? "",
          log
        );

        const input = {
          chatId: chatId,
          timestamp: now,
          messageContent: newMessage.trim(),
          senderId: authContext.user?.getUsername(),
          senderName: senderName?.fullName,
          receiverId: recIds,
          chatTypeStatus,
        };
        log.debug("createChats input: ", JSON.stringify(input));

        await API.graphql(graphqlOperation(createChats, { input: input }));

        // Clear the text input after sending the message
        setNewMessage("");

        if (
          chatType === "INDIVIDUAL" &&
          recIds.length === 1 &&
          recIds[0] !== "2" &&
          recIds[0] !== "4" &&
          recIds[0] !== "5" &&
          recIds[0] !== "3"
        ) {
          return;
        }

        // Randomly select a message and user
        let randomMessage, randomUserId, randomSenderName, randomTimestamp;

        if (chatType === "INDIVIDUAL" && recIds.length === 1) {
          if (recIds[0] === "2") {
            randomUserId = 2;
            randomSenderName = "Jane Smith";
          } else if (recIds[0] === "4") {
            randomUserId = 4;
            randomSenderName = "Emily Brown";
          } else if (recIds[0] === "5") {
            randomUserId = 5;
            randomSenderName = "Michael Wilson";
          } else if (recIds[0] === "3") {
            randomUserId = 3;
            randomSenderName = "Alex Johnson";
          } else {
            randomUserId = 1;
            randomSenderName = "John Doe";
          }
          randomMessage =
            fakeChats[Math.floor(Math.random() * fakeChats.length)];
          randomTimestamp = new Date(new Date().getTime() + 1).toISOString();
        } else {
          // For other cases, pick random values as before
          randomMessage =
            fakeChats[Math.floor(Math.random() * fakeChats.length)];
          randomUserId = recIds[Math.floor(Math.random() * recIds.length)];
          randomSenderName = ["Jane Smith", "Emily Brown", "Michael Wilson"][
            Math.floor(Math.random() * 3)
          ];
          randomTimestamp = new Date(new Date().getTime() + 1).toISOString();
        }

        // Create a new message with random content and sender
        const randomMessageInput = {
          chatId: chatId,
          timestamp: randomTimestamp,
          messageContent: randomMessage,
          senderId: randomUserId,
          senderName: randomSenderName,
          receiverId: [...recIds, authContext.user?.getUsername()],
          chatTypeStatus,
        };
        log.debug(
          "createChats input for random message: ",
          JSON.stringify(randomMessageInput)
        );

        // Send the randomly generated message
        await API.graphql(
          graphqlOperation(createChats, { input: randomMessageInput })
        );
      } catch (error) {
        console.error("Error sending message:", error);
        log.error("Error sending message:", JSON.stringify(error));
      }
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${month}/${day}, ${hours}:${minutes}`;
  };

  React.useEffect(() => {
    if (chatId) {
      fetchChatMessages();
    }
  }, [chatId]);

  const fetchChatMessages = async () => {
    log.debug("fetchChatMessages...");
    try {
      const userId = authContext.user?.getUsername;
      const chatTypeStatus = `${chatType}#ACTIVE`;
      log.debug("userId: ", JSON.stringify(userId));
      log.debug("chatId: ", JSON.stringify(chatId));
      log.debug("chatTypeStatus: ", JSON.stringify(chatTypeStatus));

      let allMessages: Chats[] = [];
      let nextToken = null;

      do {
        const filter = {
          chatId: { eq: chatId },
        };
        const response: any = await API.graphql(
          graphqlOperation(listChats, { filter, nextToken })
        );
        const chatMessages = response.data.listChats.items;

        if (chatMessages.length > 0) {
          allMessages = allMessages.concat(chatMessages);
        }

        nextToken = response.data.listChats.nextToken;
      } while (nextToken);

      setMessages(allMessages);
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      log.error("Error fetching chat messages:", JSON.stringify(error));
    }
  };

  return (
    <div style={styles.index}>
      <div style={styles.div}>
        <div
          style={{
            backgroundColor: "#FFF", // White background
            flex: 1, // Fill available space
            padding: 20, // Add padding to create the white box
            marginTop: 5, // Top margin
            marginBottom: 20, // Bottom margin
            borderRadius: 10,
          }}
        >
          {/* Chat Messages */}
          <div style={{ flexGrow: 1 }}>
            {messages.map((message, index) => (
              <div key={index}>
                {authContext.user?.getUsername() === message.senderId
                  ? renderChatBubble(message, true)
                  : renderChatBubble(message, false)}
              </div>
            ))}
          </div>
        </div>

        {/* New Message Text Input */}
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={styles.textInput}
          color="#2a2e30"
        />
        <div style={{ paddingLeft: 5, paddingRight: 5 }} />

        {/* Send Button */}
        <div style={{ marginBottom: 0 }}>
          <button style={styles.basicButton} onClick={handleSend}>
            <h2 style={styles.buttonText}>Send</h2>
          </button>
        </div>
      </div>
    </div>
  );
};
export default ChatScreen;
