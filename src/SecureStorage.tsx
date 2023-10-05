import { API, graphqlOperation } from "aws-amplify";
import {
  createOrUpdateSecureStorage,
  updateSecureStorage,
} from "./graphql/mutations";
import { getSecureStorage } from "./graphql/queries";
import { GetSecureStorageQuery } from "./API";

async function securePut(secureKey: string, secureValue: string) {
  try {
    const input = {
      secureKey,
      secureValue,
      validity: "VALID",
    };

    const result: any = await API.graphql(
      graphqlOperation(createOrUpdateSecureStorage, { input })
    );
    return result.data?.createOrUpdateSecureStorage;
  } catch (error) {
    console.error("Error in securePut:", error);
    throw error;
  }
}

async function secureGet(secureKey: string) {
  try {
    const result: any = await API.graphql(
      graphqlOperation(getSecureStorage, { secureKey })
    );

    const secureStorage = (result.data as GetSecureStorageQuery)
      ?.getSecureStorage;

    if (
      (secureStorage && secureStorage.validity === "INVALID") ||
      !secureStorage
    ) {
      return "";
    }

    return secureStorage?.secureValue;
  } catch (error) {
    console.error("Error in secureGet:", error);
    throw error;
  }
}

async function secureRemove(secureKey: string) {
  try {
    const input = {
      secureKey,
      validity: "INVALID",
    };

    const result: any = await API.graphql(
      graphqlOperation(updateSecureStorage, { input })
    );
    return result.data?.updateSecureStorage;
  } catch (error) {
    console.error("Error in secureRemove:", error);
    throw error;
  }
}

export { securePut, secureGet, secureRemove };
