import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { LogProvider } from "./CrowdSyncLogManager";
import { Amplify } from "aws-amplify";

import QueryScreen from "./components/QueryScreen";
import ResultsScreen from "./components/ResultsScreen";

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
      <Route path="/" element={<QueryScreen />} />
      <Route path="/results" element={<ResultsScreen />} />
    </Routes>
  );
};

function App() {
  return (
    <LogProvider>
      <Router>
        <AppNavigator />
      </Router>
    </LogProvider>
  );
}

export default App;
