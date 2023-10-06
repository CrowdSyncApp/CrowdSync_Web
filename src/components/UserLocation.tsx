import React, { useEffect, useState } from "react";
import styles from "./style";
import { API, graphqlOperation } from "aws-amplify";
import { useAuth } from "../QueryCaching";
import { getLocations } from "../graphql/queries";
import { useLog } from "../CrowdSyncLogManager";
import { useParams } from "react-router-dom";
import { GetLocationsQuery } from "../API";
import { Location } from "../interfaces";
import { GoogleMap, Polyline, MarkerF } from "@react-google-maps/api";

const UserLocation = () => {
  const authContext = useAuth();
  const log = useLog();
  const [location, setLocation] = useState<Location | null>(null);
  const [otherUserLocation, setOtherUserLocation] = useState<Location | null>(
    null
  );

  const { userData, sessionId } = useParams();
  const parsedUserData = JSON.parse(userData ?? "{}");

  log.debug(
    "Entering UserLocation screen on userData: " +
      JSON.stringify(userData) +
      " and sessionId: " +
      JSON.stringify(sessionId)
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        let userId;
        if (
          parsedUserData.userId === "1" ||
          parsedUserData.userId === "2" ||
          parsedUserData.userId === "3" ||
          parsedUserData.userId === "4" ||
          parsedUserData.userId === "5"
        ) {
          userId = "0949d9ce-b0b1-7019-0aba-062ae33bdd92";
        } else {
          userId = parsedUserData.userId;
        }

        const response: any = await API.graphql(
          graphqlOperation(getLocations, {
            userId: userId,
            sessionId: sessionId,
          })
        );
        log.debug("getLocations response: ", JSON.stringify(response));

        const userLocation: GetLocationsQuery = response.data;
        setLocation({
          latitude: userLocation.getLocations?.latitude ?? 0,
          longitude: userLocation.getLocations?.longitude ?? 0,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });

        const otherresponse: any = await API.graphql(
          graphqlOperation(getLocations, {
            userId: authContext.user?.getUsername(),
            sessionId: sessionId,
          })
        );

        log.debug("getLocations otherresponse", JSON.stringify(otherresponse));

        const otherUserLocation = otherresponse.data.getLocations;
        setOtherUserLocation({
          latitude: otherUserLocation.latitude,
          longitude: otherUserLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error("Error fetching user locations:", error);
        log.error("Error fetching user locations:", JSON.stringify(error));
      }
    };

    fetchData();
  }, [
    parsedUserData.userId,
    sessionId,
    setLocation,
    setOtherUserLocation,
    log,
    authContext.user,
  ]);

  return (
    <div style={{ flexGrow: 1 }}>
      <div style={styles.index}>
        <div style={styles.div}>
          {location && otherUserLocation ? (
            <GoogleMap
              mapContainerStyle={{ flex: 1, height: "100vh" }}
              center={{
                lat: otherUserLocation.latitude,
                lng: otherUserLocation.longitude,
              }}
              zoom={17}
            >
              {/* Your Marker */}
              <MarkerF
                position={{
                  lat: location.latitude,
                  lng: location.longitude,
                }}
                title="Your Location"
                key={1}
              />

              {/* Other User's Marker */}
              <MarkerF
                position={{
                  lat: otherUserLocation.latitude,
                  lng: otherUserLocation.longitude,
                }}
                title="Other User's Location"
                key={2}
              />

              {/* Polyline to show path */}
              <Polyline
                path={[
                  {
                    lat: location.latitude,
                    lng: location.longitude,
                  },
                  {
                    lat: otherUserLocation.latitude,
                    lng: otherUserLocation.longitude,
                  },
                ]}
                options={{
                  strokeColor: "#000",
                  strokeWeight: 2,
                }}
              />
            </GoogleMap>
          ) : (
            <h1>Loading...</h1>
          )}
          <img
            src={
              "https://www.thebalancemoney.com/thmb/OYJMT9EXjkDIQNx9k-McfXkwZ0Y=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/business-people-networking-in-office-lobby-719876715-5ae6212ceb97de0039a49a3c.jpg"
            }
            alt="Temp"
            object-fit="cover"
            style={{
              width: 350,
              height: 350,
              marginTop: -40,
              marginBottom: -40,
            }}
          />
          <div
            style={{
              backgroundColor: "#AAA",
              padding: 10,
              borderRadius: 10,
            }}
          >
            <p style={styles.buttonText}>I am near the front entrance!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLocation;
