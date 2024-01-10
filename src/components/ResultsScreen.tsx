import React, { useState, useEffect } from "react";
import { API, graphqlOperation } from "aws-amplify";
import { createChats } from "../graphql/mutations";
import { listChats } from "../graphql/queries";
import { onCreateChats } from "../graphql/subscriptions";
import "react-native-get-random-values";
import { useAuth } from "../QueryCaching";
import styles from "./style";
import { useLog } from "../CrowdSyncLogManager";
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

  return <div style={styles.index}></div>;
};
export default ChatScreen;
