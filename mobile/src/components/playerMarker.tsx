import styled from "@emotion/native";
import { Marker } from "react-native-maps";
import { SocketResponse } from "../types";
import { useEffect, useRef, useState } from "react";
import { Animated } from "react-native";
import { callMicrotasks } from "react-native-reanimated/lib/typescript/reanimated2/threads";

const Container = styled.View`
  width: 155px;
  height: 94px;
  align-items: start;
  justify-content: center;
`;

const ImageContainer = styled.Pressable`
  width: 31px;
  height: 31px;
  border-radius: 22.5px;
  justify-content: center;
  align-items: center;
`;

const ProfilePicture = styled.Image`
  width: 25px;
  height: 25px;
  border-radius: 25px;
`;

const CustomCalloutBackground = styled.Image`
  height: 100%;
  width: 100%;
  position: absolute;
`;
const CallOut = styled.View``;

const Title = styled.Text`
  font-size: 16px;
  font-family: Inter_700Bold;
  padding-left: 18px;
  padding-top: 6px;
  color: #fff;
`;

const PlayerMarker: React.FC<SocketResponse> = ({ typ, dat }) => {
  const [callOutVisible, setCallOutVisible] = useState(false);
  const callOutScale = useRef(new Animated.Value(0)).current;

  callOutScale.addListener((value) => {
    if (callOutVisible && value.value == 0) setCallOutVisible(false);
  });

  function toggleCallOut() {
    console.log("kutas");
    if (!callOutVisible) setCallOutVisible(true);
    Animated.timing(callOutScale, {
      toValue: callOutVisible ? 0 : 1,
      useNativeDriver: false,
      duration: 300,
    }).start();
  }

  if (dat.loc == undefined || dat.team == undefined || dat.user == undefined) return;

  return (
    <Marker
      coordinate={{ latitude: dat.loc.lat, longitude: dat.loc.lng }}
      anchor={callOutVisible ? { x: 0.1, y: 0.5 } : { x: 0.5, y: 0.5 }}
      onPress={toggleCallOut}
    >
      <Container
        style={{ width: callOutVisible ? 155 : 31, height: callOutVisible ? 94 : 31 }}
      >
        <ImageContainer
          style={{ backgroundColor: dat.team.color }}
          onPress={() => {
            console.log("bruh");
          }}
        >
          <ProfilePicture
            source={{ uri: `${dat.user.image}?size=32px` }}
          ></ProfilePicture>
        </ImageContainer>
        {callOutVisible && (
          <Animated.View
            style={{
              height: 94,
              width: 114,
              position: "absolute",
              transform: [{ scale: callOutScale }],
              left: callOutScale.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 41],
              }),
              opacity: callOutScale,
            }}
          >
            <CustomCalloutBackground
              source={require("./../../assets/calloutBackground.png")}
            />
            <Title>{dat.user.name}</Title>
          </Animated.View>
        )}
      </Container>
    </Marker>
  );
};

export default PlayerMarker;
