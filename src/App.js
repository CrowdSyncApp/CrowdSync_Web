import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./QueryCaching";
import { LogProvider } from "./CrowdSyncLogManager";
import { Amplify } from "aws-amplify";
import awsmobile from "./aws-exports";
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

Amplify.configure(awsmobile);

Amplify.configure({
  API: {
    graphql_endpoint: 'https://nuv7tifvtnfmdcezkleopjfmny.appsync-api.us-west-1.amazonaws.com/graphql',
    graphql_headers: async () => ({
      'aws_appsync_apiKey': 'da2-ttcizi64dne7rc7rzzndxnnwga',
    })
  }
});

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
