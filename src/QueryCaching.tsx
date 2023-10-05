import { createContext, useContext, useEffect, useState } from "react";
import { Auth, API, Storage, Hub, graphqlOperation } from "aws-amplify";
import { CognitoUser } from "@aws-amplify/auth";
import {
  getUserProfiles,
  listTagSets,
  listUserTags,
  getTagSet,
  listConnections,
} from "./graphql/queries";
import { getSessionData } from "./components/SessionManager";
import { v4 } from "uuid";
import {
  updateUserProfiles,
  createUserTags,
  deleteUserTags,
  createOrUpdateLocations,
} from "./graphql/mutations";
import { useLog } from "./CrowdSyncLogManager";
import { Logger } from "aws-amplify";
import { securePut, secureGet, secureRemove } from "./SecureStorage";
import {
  ProviderProps,
  Location,
  Tag,
  UserProfileData,
  Credentials,
} from "./interfaces";
import * as APITypes from "./API";
import { UserProfiles } from "./API";

interface AuthContextType {
  user: CognitoUser | null;
  login: (credentials: Credentials, log: Logger) => void;
  logout: (log: Logger) => void;
  isLoading: Boolean;
  uploadImageToS3: (profilePictureUri: string, log: Logger) => Promise<string>;
  getTagSets: (log: Logger) => Promise<Array<string>>;
  updateUserProfileTable: (
    updatedFields: APITypes.UpdateUserProfilesMutation,
    log: Logger
  ) => Promise<UserProfiles | null>;
  removeUserTagsByTagId: (
    userId: string,
    tags: Array<Tag>,
    log: Logger
  ) => void;
  fetchConnectionsAndProfiles: (
    userId: string,
    log: Logger
  ) => Promise<Array<UserProfiles> | undefined>;
  fetchUserProfileData: () => Promise<UserProfiles | null>;
  getUserProfileFromId: (
    userId: string,
    log: Logger
  ) => Promise<UserProfileData | null>;
  addUserTags: (
    userId: string,
    tagIds: Array<string>,
    fullName: string,
    log: Logger
  ) => Promise<Array<Tag>>;
  fetchUserProfileImage: (
    identityId: string,
    profilePictureFilename: string,
    log: Logger
  ) => Promise<string>;
  refreshLocation: (log: Logger) => Promise<Location | null>;
  storeInterval: (intervalId: NodeJS.Timeout, log: Logger) => void;
  clearAllIntervals: (log: Logger) => void;
  isUserLoggedIn: Boolean;
  getAllUserTags: (userId: string, log: Logger) => Promise<Array<Tag>>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: (credentials: Credentials, log: Logger) => {},
  logout: (log: Logger) => {},
  isLoading: false,
  uploadImageToS3: async (profilePictureUri: string, log: Logger) => "",
  getTagSets: async (log: Logger) => [],
  updateUserProfileTable: async (
    updatedFields: APITypes.UpdateUserProfilesMutation,
    log: Logger
  ) => null,
  removeUserTagsByTagId: (userId: string, tags: Array<Tag>, log: Logger) => {},
  fetchConnectionsAndProfiles: async (userId: string, log: Logger) => [],
  fetchUserProfileData: async () => null,
  getUserProfileFromId: async (userId: string, log: Logger) => null,
  addUserTags: async (
    userId: string,
    tagIds: Array<string>,
    fullName: string,
    log: Logger
  ) => [],
  fetchUserProfileImage: async (
    identityId: string,
    profilePictureFilename: string,
    log: Logger
  ) => "",
  refreshLocation: async (log: Logger) => null,
  storeInterval: (intervalId: NodeJS.Timeout, log: Logger) => {},
  clearAllIntervals: (log: Logger) => {},
  isUserLoggedIn: false,
  getAllUserTags: async (userId: string, log: Logger) => [],
});

export function useAuth() {
  return useContext(AuthContext);
}

async function storeInterval(intervalId: NodeJS.Timeout, log: Logger) {
  try {
    log.debug("Storing interval: ", JSON.stringify(intervalId));
    // Retrieve the existing list of intervalIds from AsyncStorage (if any)
    const existingIntervalIdsJson = await secureGet("intervalIds");
    const existingIntervalIds = existingIntervalIdsJson
      ? JSON.parse(existingIntervalIdsJson)
      : [];

    // Add the new intervalId to the list
    existingIntervalIds.push(intervalId);
    log.debug("All interval IDs: ", JSON.stringify(existingIntervalIds));

    // Convert the updated list back to JSON and store it in AsyncStorage
    await securePut("intervalIds", JSON.stringify(existingIntervalIds));

    console.log(`Interval with ID ${intervalId} stored successfully.`);
  } catch (error) {
    console.error("Error storing interval ID:", error);
    log.error("Error storing interval ID:", JSON.stringify(error));
  }
}

async function clearAllIntervals(log: Logger) {
  try {
    log.debug("Clearing all intervals");
    // Retrieve the list of intervalIds from AsyncStorage
    const intervalIdsJson = await secureGet("intervalIds");
    const intervalIds = intervalIdsJson ? JSON.parse(intervalIdsJson) : [];

    // Clear each interval using clearInterval
    intervalIds.forEach((intervalId: string) => {
      clearInterval(intervalId);
      console.log(`Interval with ID ${intervalId} cleared.`);
    });

    // Clear the list of intervalIds from AsyncStorage
    await secureRemove("intervalIds");

    console.log("All intervals cleared.");
    log.debug("All intervals cleared.");
  } catch (error) {
    console.error("Error clearing intervals:", error);
    log.error("Error clearing intervals:", JSON.stringify(error));
  }
}

async function fetchUserProfileImage(
  identityId: string,
  profilePictureFilename: string,
  log: Logger
) {
  log.debug(
    "Fetching user profile image for ID: " +
      identityId +
      " and filename: " +
      profilePictureFilename
  );
  if (!identityId) {
    // Assume Guest Profile, use fake profile picture
    log.debug(
      "No identityId, using profilePictureFilename: ",
      JSON.stringify(profilePictureFilename)
    );
    return profilePictureFilename;
  }

  try {
    let getLevel: any = "protected";
    if (!profilePictureFilename) {
      // Default image
      profilePictureFilename = "CrowdSync_Temp_Profile.png";
      getLevel = "public";
      log.debug("Using default public image.");
    }

    // Fetch the profile image URL from S3 using Amplify's Storage API
    const imageKey = await Storage.get(profilePictureFilename, {
      level: getLevel,
      validateObjectExistence: true,
      identityId: identityId,
    });
    log.debug("profilePictureFilename results: ", JSON.stringify(imageKey));

    return imageKey;
  } catch (error) {
    console.error("Error fetching profile image:", error);
    log.error("Error fetching profile image:", JSON.stringify(error));
    profilePictureFilename = "CrowdSync_Temp_Profile.png";
    const imageKey = await Storage.get(profilePictureFilename, {
      level: "public",
      validateObjectExistence: true,
    });
    return imageKey;
  }
}

async function fetchUserProfile(userId: string, log: Logger) {
  log.debug("Fetching user profile: ", JSON.stringify(userId));
  try {
    const cachedUserProfile = await secureGet("userProfileData");
    if (cachedUserProfile) {
      log.debug("Returning cached user profile.");
      return JSON.parse(cachedUserProfile);
    }

    const response: any = await API.graphql(
      graphqlOperation(getUserProfiles, { userId })
    );
    const data = response.data;
    log.debug("getUserProfiles results: ", JSON.stringify(data));

    if (data && data.getUserProfiles) {
      let identityId;
      if (!data.getUserProfiles.identityId) {
        log.debug("Getting user " + userId + "'s identityId.");
        const currCreds = await Auth.currentCredentials();
        identityId = currCreds.identityId;
        log.debug("identityId: ", JSON.stringify(identityId));
        data.getUserProfiles.identityId = identityId;

        const input = {
          input: {
            userId: userId,
            identityId: identityId,
          },
        };

        await API.graphql(graphqlOperation(updateUserProfiles, input));
        log.debug("updateUserProfiles complete.");
      }

      const userTags = await getAllUserTags(userId, log);
      data.getUserProfiles.tags = userTags;

      await securePut("userProfileData", JSON.stringify(data.getUserProfiles));

      log.debug("User Profile Data: ", JSON.stringify(data.getUserProfiles));
      return data.getUserProfiles;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    log.error("Error fetching user profile:", JSON.stringify(error));
    throw error;
  }
}

async function refreshLocation(log: Logger): Promise<Location | null> {
  log.debug("Refreshing location.");
  try {
    const user = await fetchUser(log);

    let userId;
    if (!user || !user.username) {
      console.error("User data or userId is missing.");
      log.error("User data or userId is missing.");
      userId = "0949d9ce-b0b1-7019-0aba-062ae33bdd92"; // TODO fix with no authenticated users
    } else {
      userId = user?.username;
    }
    log.debug("refreshLocation userId: ", JSON.stringify(userId));

    const sessionData = await getSessionData(log);
    let sessionId;
    if (!sessionData) {
      sessionId = "INACTIVE";
    } else {
      sessionId = sessionData.sessionId;
    }
    log.debug("refreshLocation sessionId: ", JSON.stringify(sessionId));

    const position: any = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    });

    const { latitude, longitude } = position.coords;
    const location = {
      latitude,
      longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    log.debug("Location: ", JSON.stringify(location));

    const now = new Date().toISOString();
    const input = {
      userId: userId,
      latitude: location.latitude,
      longitude: location.longitude,
      sessionId: sessionId,
      timestamp: now,
    };

    log.debug("createOrUpdateLocations input: ", JSON.stringify(input));
    // Perform GraphQL update operation
    const response = await API.graphql(
      graphqlOperation(createOrUpdateLocations, { input: input })
    );
    log.debug("createOrUpdateLocations results: ", JSON.stringify(response));

    return location;
  } catch (error) {
    console.error("Error refreshing location:", error);
    log.error("Error refreshing location:", JSON.stringify(error));
    return null;
  }
}

async function getUserProfileFromId(userId: string, log: Logger) {
  log.debug("getUserProfileFromId on userId: ", JSON.stringify(userId));
  try {
    // Make the GraphQL API call to fetch the user profile
    const response: any = await API.graphql(
      graphqlOperation(getUserProfiles, { userId: userId })
    );
    log.debug("getUserProfiles response: ", JSON.stringify(response));

    // Extract the user profile from the response
    const userProfile = response.data.getUserProfiles;

    return userProfile;
  } catch (error) {
    console.error(`Error fetching user profile for userId ${userId}:`, error);
    log.error(
      `Error fetching user profile for userId ${userId}:`,
      JSON.stringify(error)
    );
    throw error; // You can handle the error as needed
  }
}

async function fetchUser(log: Logger) {
  log.debug("fetchUser...");
  try {
    const storedUser = await Auth.currentAuthenticatedUser();
    log.debug("storedUser: ", JSON.stringify(storedUser));
    return storedUser;
  } catch (error) {
    console.error("Error fetching user:", error);
    log.error("Error fetching user:", JSON.stringify(error));
    return null;
  }
}

async function login(credentials: Credentials, log: Logger) {
  log.debug("login with username: ", JSON.stringify(credentials.username));
  try {
    const user = await Auth.signIn(credentials.username, credentials.password);
    return user;
  } catch (error: any) {
    if (error.message === "User is not confirmed.") {
      alert("Please verify your account before logging in.");
      log.error("Please verify your account before logging in.");
    } else {
      alert("Invalid email or password. Please try again.");
      log.error("Invalid email or password. Please try again.");
    }
    throw error;
  }
}

async function logout(log: Logger) {
  log.debug("logout");
  try {
    await Auth.signOut();
    await secureRemove("userProfileData");
    await secureRemove("sessionData");
    log.debug("Logged out");
  } catch (error) {
    console.error("Logout error:", error);
    log.error("Logout error:", JSON.stringify(error));
    throw error;
  }
}

const fetchConnectionsAndProfiles = async (userId: string, log: Logger) => {
  log.debug("fetchConnectionsAndProfiles on userId: ", JSON.stringify(userId));
  try {
    // Fetch all connections for the current user
    const connectionsResponse: any = await API.graphql(
      graphqlOperation(listConnections, {
        filter: {
          userId: { eq: userId },
        },
      })
    );
    log.debug("listConnections result: ", JSON.stringify(connectionsResponse));

    // Extract the connections data
    const connections = connectionsResponse.data.listConnections.items;

    // Fetch user profiles for each connection
    const profilesPromises = connections.map(async (connection: any) => {
      const userProfileResponse: any = await API.graphql(
        graphqlOperation(getUserProfiles, { userId: connection.otherUserId })
      );
      log.debug(
        "getUserProfiles results: ",
        JSON.stringify(userProfileResponse)
      );

      return userProfileResponse.data.getUserProfiles;
    });

    // Wait for all profile fetches to complete
    const profiles = await Promise.all(profilesPromises);
    log.debug("All connection profiles: ", JSON.stringify(profiles));

    return profiles;
  } catch (error) {
    console.error("Error fetching data:", error);
    log.error("Error fetching data:", JSON.stringify(error));
  }
};

const getUserTagsIds = async (userId: string, log: Logger) => {
  log.debug("getUserTagsIds on userId: " + userId);
  try {
    const response: any = await API.graphql(
      graphqlOperation(listUserTags, {
        filter: {
          userId: { eq: userId },
        },
      })
    );
    log.debug("listUserTags results: ", JSON.stringify(response));

    const userTags = response.data.listUserTags.items || [];
    const tagIds = userTags.map((tag: Tag) => tag.tagId);

    log.debug("tagIds: ", JSON.stringify(tagIds));
    return tagIds;
  } catch (error) {
    console.error("Error fetching user tags:", error);
    log.error("Error fetching user tags:", JSON.stringify(error));
    return [];
  }
};

const getAllUserTags = async (userId: string, log: Logger) => {
  log.debug("getAllUserTags on userId: " + userId);
  try {
    const tagIds = await getUserTagsIds(userId, log);
    const tagSets = await getTagSets(log);

    const userTagsWithTags = tagIds
      .map((tagId: string) => tagSets.find((tag) => tag.tagId === tagId))
      .filter((tag: Tag) => tag);

    log.debug("userTagsWithTags: ", JSON.stringify(userTagsWithTags));
    return userTagsWithTags;
  } catch (error) {
    console.error("Error fetching user tags with tags:", error);
    log.error("Error fetching user tags with tags:", JSON.stringify(error));
    return [];
  }
};

const getTagSets = async (log: Logger) => {
  log.debug("getTagSets...");
  try {
    // Initialize an array to store all tag sets
    const allTagSets = [];

    // Start with a null nextToken
    let nextToken = null;

    do {
      // Fetch a batch of tag sets using pagination
      const response: any = await API.graphql(
        graphqlOperation(listTagSets, {
          limit: 100, // Adjust the limit as needed to retrieve all entries in batches
          nextToken, // Use the nextToken from the previous response
        })
      );

      const { items, nextToken: newNextToken } = response.data.listTagSets;

      // Add the retrieved items to the result array
      allTagSets.push(...items);

      // Update the nextToken for the next iteration
      nextToken = newNextToken;
    } while (nextToken); // Continue until there are no more items

    // Store the tag sets in sessionStorage
    await securePut("tagSet", JSON.stringify(allTagSets));

    return allTagSets;
  } catch (error) {
    console.error("Error listing TagSets:", error);
    log.error("Error listing TagSets:", JSON.stringify(error));
    return [];
  }
};

const addUserTags = async (
  userId: string,
  tagIds: Array<string>,
  fullName: string,
  log: Logger
) => {
  log.debug(
    "addUserTags on userId: " +
      userId +
      " and tagIds: " +
      tagIds +
      " and fullName: " +
      fullName
  );
  try {
    const batchCreatePromises = tagIds.map(async (tagId: any) => {
      const currTagId = tagId.tagId;
      const input = {
        userId: userId,
        tagId: currTagId,
        fullName: fullName,
      };
      await API.graphql(graphqlOperation(createUserTags, { input }));
      const tagSetResponse: any = await API.graphql(
        graphqlOperation(getTagSet, { tagId: currTagId })
      );
      const tag = tagSetResponse.data.getTagSet.tag;
      return { tagId: currTagId, tag: tag };
    });

    const addedTags = await Promise.all(batchCreatePromises);
    log.debug("addedTags: ", JSON.stringify(addedTags));
    console.log("User tags batch added successfully.");
    return addedTags;
  } catch (error) {
    console.error("Error adding user tags:", error);
    log.error("Error adding user tags:", JSON.stringify(error));
    return [];
  }
};

const removeUserTagsByTagId = async (
  userId: string,
  tags: Array<Tag>,
  log: Logger
) => {
  log.debug(
    "removeUserTagsByTagId on userId: " +
      userId +
      " and tags: " +
      JSON.stringify(tags)
  );
  try {
    const deletePromises = tags.map(async (tag) => {
      const input = {
        input: {
          userId,
          tagId: tag.tagId,
        },
      };
      log.debug("Deleting UserTag:", JSON.stringify(input));

      // Call the deleteUserTags mutation to delete the UserTag
      await API.graphql(graphqlOperation(deleteUserTags, input));
    });

    // Execute all delete operations concurrently
    await Promise.all(deletePromises);

    log.debug("UserTags deleted successfully");
  } catch (error) {
    console.error("Error deleting UserTags:", error);
    log.error("Error deleting UserTags:", JSON.stringify(error));
    throw error; // Rethrow the error for handling at the caller level
  }
};

async function uploadImageToS3(profilePictureUri: string, log: Logger) {
  log.debug(
    "uploadImageToS3 on profilePictureUri: ",
    JSON.stringify(profilePictureUri)
  );
  const filename = v4() + "_profilePhoto.jpeg";
  log.debug("filename: ", JSON.stringify(filename));
  const response = await fetch(profilePictureUri);
  const blob = await response.blob();

  await Storage.put(filename, blob, {
    level: "protected",
    contentType: "image/jpeg",
  });

  return filename;
}

async function updateUserProfileTable(
  updatedFields: APITypes.UpdateUserProfilesMutation,
  log: Logger
) {
  log.debug(
    "updateUserProfileTable on updatedFields: ",
    JSON.stringify(updatedFields)
  );
  const updatedUserProfile: any = await API.graphql(
    graphqlOperation(updateUserProfiles, { input: updatedFields })
  );
  await secureRemove("userProfileData");
  log.debug(
    "updatedUserProfile.data.updateUserProfiles: ",
    updatedUserProfile.data.updateUserProfiles
  );
  return updatedUserProfile.data.updateUserProfiles;
}

export function AuthProvider({ children }: ProviderProps) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const log = useLog();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = await Auth.currentAuthenticatedUser();
        setUser(storedUser);
      } catch (error) {
        setUser(null);
      }
      setIsLoading(false);
    };

    fetchUserData();

    const authListener = (data: any) => {
      switch (data.payload.event) {
        case "signIn":
          fetchUserData();
          break;
        case "signOut":
          setUser(null);
          break;
        default:
          break;
      }
    };

    Hub.listen("auth", authListener);

    return () => Hub.remove("auth", authListener);
  }, []);

  const isUserLoggedIn = user !== null;

  const fetchUserProfileData = async () => {
    // TODO this is a temp fix. Really should figure out why it's caching the previous log in
    const storedUser = await Auth.currentAuthenticatedUser();
    if (storedUser && storedUser.username) {
      const userProfileData = await fetchUserProfile(storedUser.username, log);
      return userProfileData;
    }
    return null;
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    isLoading,
    uploadImageToS3,
    getTagSets,
    updateUserProfileTable,
    removeUserTagsByTagId,
    fetchConnectionsAndProfiles,
    fetchUserProfileData,
    getUserProfileFromId,
    addUserTags,
    fetchUserProfileImage,
    refreshLocation,
    storeInterval,
    clearAllIntervals,
    isUserLoggedIn,
    getAllUserTags,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
