import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./QueryCaching";
import { LogProvider } from "./CrowdSyncLogManager";
import { Amplify } from "aws-amplify";
import { LoadScript } from "@react-google-maps/api";

import LoginScreen from "./components/LoginScreen";
import SignUp from "./components/SignUp";
import FindSession from "./components/FindSession";
import QRScannerScreen from "./components/QRScannerScreen";
import SessionHomeScreen from "./components/SessionHomeScreen";
import ProfileScreen from "./components/ProfileScreen";
import OtherUserProfileScreen from "./components/OtherUserProfileScreen";
import ChatScreen from "./components/ChatScreen";
import MyConnections from "./components/MyConnections";
import ForgotPassword from "./components/ForgotPassword";
import UserLocation from "./components/UserLocation";

const awsmobile = {
  "name": "crowdsync-web",
  "version": "0.1.0",
  "homepage": "https://main.d2jor45tr2cyp1.amplifyapp.com/",
  "private": true,
  "dependencies": {
    "@react-google-maps/api": "^2.19.2",
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "aws-amplify": "^5.3.11",
    "aws-sdk": "^2.1467.0",
    "qrcode.react": "^3.1.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-modal": "^3.16.1",
    "react-router-dom": "^6.16.0",
    "react-scripts": "^5.0.1",
    "text-encoding": "^0.7.0",
    "web-vitals": "^2.1.4"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  },
  "devDependencies": {
    "@types/crypto-js": "^4.1.2",
    "@types/google.maps": "^3.54.3",
    "@types/react-modal": "^3.16.1",
    "@types/text-encoding": "^0.0.37",
    "@types/uuid": "^9.0.4"
  }
};

Amplify.configure(awsmobile);

const AppNavigator = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route path="/chat/:participants/:chatType" element={<ChatScreen />} />
      <Route path="/findsession" element={<FindSession />} />
      <Route path="/qrcode" element={<QRScannerScreen />} />
      <Route path="/sessionhome/:sessionData" element={<SessionHomeScreen />} />
      <Route path="/profile/:userprofiledata" element={<ProfileScreen />} />
      <Route path="/otheruser/:userData/:sessionId" element={<OtherUserProfileScreen />} />
      <Route path="/connections/:userProfileData" element={<MyConnections />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/userlocation/:userData/:sessionId" element={<UserLocation />} />
    </Routes>
  );
};

function App() {
  return (
    <LogProvider>
      <AuthProvider>
        <Router>
          <LoadScript googleMapsApiKey="AIzaSyDpQkIQ690BaoZdhOTypPfrWl7rruN2Srs" />
          <AppNavigator />
        </Router>
      </AuthProvider>
    </LogProvider>
  );
}

export default App;
