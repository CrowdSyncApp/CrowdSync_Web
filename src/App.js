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
  "aws_project_region": "us-west-1",
  "aws_appsync_graphqlEndpoint": "https://nuv7tifvtnfmdcezkleopjfmny.appsync-api.us-west-1.amazonaws.com/graphql",
  "aws_appsync_region": "us-west-1",
  "aws_appsync_authenticationType": "API_KEY",
  "aws_appsync_apiKey": "da2-ttcizi64dne7rc7rzzndxnnwga",
  "aws_cognito_identity_pool_id": "us-west-1:324c95b5-17cb-4635-a7a6-5e81d07d737e",
  "aws_cognito_region": "us-west-1",
  "aws_user_pools_id": "us-west-1_dKIJ0foij",
  "aws_user_pools_web_client_id": "7qlsnl0fi9ql85p3l2fhreeejv",
  "oauth": {},
  "aws_cognito_username_attributes": [
      "EMAIL",
      "PHONE_NUMBER"
  ],
  "aws_cognito_social_providers": [],
  "aws_cognito_signup_attributes": [
      "EMAIL"
  ],
  "aws_cognito_mfa_configuration": "OFF",
  "aws_cognito_mfa_types": [
      "SMS"
  ],
  "aws_cognito_password_protection_settings": {
      "passwordPolicyMinLength": 8,
      "passwordPolicyCharacters": [
          "REQUIRES_LOWERCASE",
          "REQUIRES_UPPERCASE",
          "REQUIRES_NUMBERS"
      ]
  },
  "aws_cognito_verification_mechanisms": [
      "EMAIL"
  ],
  "aws_user_files_s3_bucket": "crowdsyncuserprofileimages",
  "aws_user_files_s3_bucket_region": "us-west-1",
  "aws_mobile_analytics_app_id": "c29ef46086b54f1987373e9888a3ea7d",
  "aws_mobile_analytics_app_region": "us-west-2",
  "Analytics": {
      "AWSPinpoint": {
          "appId": "c29ef46086b54f1987373e9888a3ea7d",
          "region": "us-west-2"
      }
  },
  "Notifications": {
      "Push": {
          "AWSPinpoint": {
              "appId": "c29ef46086b54f1987373e9888a3ea7d",
              "region": "us-west-2"
          }
      }
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
