import React, { useState, useEffect } from "react";
import "react-native-get-random-values";
import styles from "./style";
import { useLog } from "../CrowdSyncLogManager";
import { useParams } from "react-router-dom";

const ResultsScreen = () => {
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState("");
  const [recIds, setRecIds] = useState([]);
  const log = useLog();

  return (
    <div
      style={{
        backgroundColor: "#001f3f",
        color: "#fff",
        height: "100vh", // Make the background cover the whole screen
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1>CrowdSync</h1>
      <div>
        <h2>User</h2>
        <p>Chris Huynh</p>
      </div>
      <div>
        <h3>Event</h3>
        <p>
          <a
            href="https://www.denverstartupweek.org/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "red",
              textDecoration: "underline",
              fontSize: "20px",
            }}
          >
            Denver Startup Week
          </a>
        </p>
      </div>
      <div>
        <h3>Possible Matches</h3>
        <table
          style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Rank</th>
              <th>Name</th>
              <th>Shared Interests</th>
              <th>Cold Open</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "10px" }}>1.</td>
              <td style={{ padding: "10px" }}>Ben Collins</td>
              <td style={{ padding: "10px" }}>
                Entrepreneur, Techstars, Machine Learning
              </td>
              <td style={{ padding: "10px" }}>
                Did you hear about the upcoming Techstars Demo Day? It will have
                a surprise guest speaker.
              </td>
            </tr>
            <tr>
              <td style={{ padding: "10px" }}>2.</td>
              <td style={{ padding: "10px" }}>Malte Witt</td>
              <td style={{ padding: "10px" }}>
                Entrepreneur, Denver, Apple Inc.
              </td>
              <td style={{ padding: "10px" }}>
                I saw you recently went to the Utah Startup Week. What was the
                most standout startup you saw?
              </td>
            </tr>
            <tr>
              <td style={{ padding: "10px" }}>3.</td>
              <td style={{ padding: "10px" }}>Ben Deda</td>
              <td style={{ padding: "10px" }}>
                Entrepreneur, Techstars, Machine Learning
              </td>
              <td style={{ padding: "10px" }}>
                Ben Deda just launched a new app, crowdsync.com, ask him about
                it!
              </td>
            </tr>
            <tr>
              <td style={{ padding: "10px" }}>4.</td>
              <td style={{ padding: "10px" }}>John Doe</td>
              <td style={{ padding: "10px" }}>
                Apple Inc, Accenture, Citadel, Point72
              </td>
              <td style={{ padding: "10px" }}>
                You two used to be coworkers at Accenture. Ask him about his
                latest ventures.
              </td>
            </tr>
            <tr>
              <td style={{ padding: "10px" }}>5.</td>
              <td style={{ padding: "10px" }}>Jane Eyre</td>
              <td style={{ padding: "10px" }}>
                Crowdsync, LinkedIn, Sequioa Alumni Day, Harvard University
              </td>
              <td style={{ padding: "10px" }}>
                Jane Eyre just went to CrowdSync's launch party last week!
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ResultsScreen;
