// interfaces.ts
import { ReactNode } from 'react';
import { UserProfiles } from "./API";

interface NavigationTransition {
  action: string;
  location: Location;
  prevLocation: Location | null;
}
export type Blocker = (tx: NavigationTransition) => string | boolean | null;

export interface SessionData {
  sessionId: string,
  startTime: string,
  title: string,
  creatorId: string,
  status: string,
  description: string,
  tags: Array<string>,
}

export interface LayoutEvent {
  nativeEvent: {
    layout: {
      height: number;
      width: number;
      x: number;
      y: number;
    };
  };
}

export interface Credentials {
  username: string,
  password: string,
}

export interface Location {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}
export interface Tag {
  tagId: string;
  tag: string;
}

export interface UserProfileData extends UserProfiles {
  tags: Array<string>
}

export interface ProviderProps {
  children: ReactNode;
}

export type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};
export type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};
export type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};