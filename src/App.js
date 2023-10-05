import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./QueryCaching";
import { LogProvider } from "./CrowdSyncLogManager";
import { Amplify } from "aws-amplify";
import awsmobile from "./aws-exports";

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

Amplify.configure(awsmobile);

const AppNavigator = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginScreen />} />
      <Route path="/chat/:participants/:chatType" element={<ChatScreen />} />
      <Route path="/findsession" element={<FindSession />} />
      <Route path="/qrcode" element={<QRScannerScreen />} />
      <Route path="/sessionhome/:sessionData" element={<SessionHomeScreen />} />
      <Route path="/profile" element={<ProfileScreen />} />
      <Route path="/otheruser" element={<OtherUserProfileScreen />} />
      <Route path="/connections" element={<MyConnections />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/userlocation" element={<UserLocation />} />
    </Routes>
  );
};

function App() {
  return (
    <LogProvider>
      <AuthProvider>
        <Router>
          <AppNavigator />
        </Router>
      </AuthProvider>
    </LogProvider>
  );
}

export default App;
