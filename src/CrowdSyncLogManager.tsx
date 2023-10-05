import React, { createContext, useContext } from 'react';
import { Logger, AWSCloudWatchProvider, Amplify } from 'aws-amplify';
import awsmobile from "./aws-exports";
import { TextEncoder, TextDecoder } from 'text-encoding';
import { ProviderProps } from './interfaces';

if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}

const LogContext = createContext(new Logger('default'));

export function useLog() {
    return useContext(LogContext);
}

export function LogProvider({ children }: ProviderProps) {

    const logStreamName = `CrowdSync_Log_Stream_${Date.now()}`;
    console.log("Activating CloudWatch on logGroupName: CrowdSync_Debug_Logs and logStreamName: " + logStreamName);

    const log = new Logger('CrowdSync', 'DEBUG');
    Amplify.register(log);
    log.addPluggable(new AWSCloudWatchProvider({
        logGroupName: 'CrowdSync_Debug_Logs',
      logStreamName: logStreamName,
      region: awsmobile.aws_project_region,
    }))

    return <LogContext.Provider value={log}>{children}</LogContext.Provider>;
}
