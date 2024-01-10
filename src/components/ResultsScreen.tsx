import React, { useState, useEffect } from "react";
import "react-native-get-random-values";
import { useAuth } from "../QueryCaching";
import styles from "./style";
import { useLog } from "../CrowdSyncLogManager";
import { useParams } from "react-router-dom";

const ResultsScreen = () => {
  const [newMessage, setNewMessage] = useState("");
  const [chatId, setChatId] = useState("");
  const [recIds, setRecIds] = useState([]);
  const authContext = useAuth();
  const log = useLog();

  return (
    <div style={{ backgroundColor: "#001f3f", color: "#fff", padding: "20px" }}>
      <h1>CrowdSync</h1>
      <div>
        <h2>Title (Fill in later)</h2>
        <p>Detail text (Fill in later)</p>
      </div>
      <div>
        <h3>Smaller Header</h3>
        <p>More detail text (Fill in later)</p>
      </div>
      <div>
        <h3>Another Header</h3>
        <table
          style={{
            width: "100%",
            marginTop: "10px",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>Column 1</th>
              <th>Column 2</th>
              <th>Column 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Row 1, Cell 1</td>
              <td>Row 1, Cell 2</td>
              <td>Row 1, Cell 3</td>
            </tr>
            <tr>
              <td>Row 2, Cell 1</td>
              <td>Row 2, Cell 2</td>
              <td>Row 2, Cell 3</td>
            </tr>
            <tr>
              <td>Row 3, Cell 1</td>
              <td>Row 3, Cell 2</td>
              <td>Row 3, Cell 3</td>
            </tr>
            <tr>
              <td>Row 4, Cell 1</td>
              <td>Row 4, Cell 2</td>
              <td>Row 4, Cell 3</td>
            </tr>
            <tr>
              <td>Row 5, Cell 1</td>
              <td>Row 5, Cell 2</td>
              <td>Row 5, Cell 3</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ResultsScreen;
