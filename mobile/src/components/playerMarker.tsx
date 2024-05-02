import styled from "@emotion/native";
import { Marker } from "react-native-maps";
import { LocationPayload } from "../types";
import { useEffect, useRef, useState } from "react";
import { Animated, Easing } from "react-native";

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

const Title = styled.Text`
  font-size: 20px;
  font-family: Inter_700Bold;
  padding-left: 18px;
  padding-top: 6px;
  letter-spacing: -1.6px;
  color: #fff;
`;

const GrayText = styled.Text`
  font-size: 13px;
  font-family: Inter_400Regular;
  padding-left: 18px;
  letter-spacing: -0.8px;
  color: #fff;
  opacity: 0.5;
`;

type PlayerMarkerProps = {
  dat: LocationPayload;
  onPress: () => void;
  selected: boolean;
};

const PlayerMarker: React.FC<PlayerMarkerProps> = ({ dat, onPress, selected }) => {
  const [callOutVisible, setCallOutVisible] = useState(false);
  const [shallTrackChanges, setShallTrackChanges] = useState(false);
  const callOutScale = useRef(new Animated.Value(0)).current;

  // 1 - visible, 0 - not visible
  function toggleCallOut(value: number) {
    if (!callOutVisible) setCallOutVisible(true);
    Animated.timing(callOutScale, {
      toValue: value,
      useNativeDriver: false,
      duration: 350,
      easing: Easing.exp,
    }).start(() => {
      setTimeout(() => {
        if (value === 0) setCallOutVisible(false);
        setShallTrackChanges(false);
      }, 350);
    });
  }

  useEffect(() => {
    setShallTrackChanges(true);
    toggleCallOut(selected ? 1 : 0);
  }, [selected]);

  if (dat.loc == undefined || dat.team == undefined || dat.user == undefined) return;

  return (
    <Marker
      coordinate={{ latitude: dat.loc.lat, longitude: dat.loc.lng }}
      anchor={{ x: callOutVisible ? 0.1 : 0.5, y: 0.5 }}
      onPress={onPress}
      tracksViewChanges={shallTrackChanges}
    >
      <Container
        style={callOutVisible ? { width: 155, height: 94 } : { width: 31, height: 31 }}
      >
        <ImageContainer style={{ backgroundColor: dat.team.color }} onPress={() => {}}>
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
            <Title numberOfLines={1}>{dat.user.name}</Title>
            <GrayText numberOfLines={1}>{dat.team.name}</GrayText>
            <GrayText style={{ paddingTop: 15 }}>
              {dat.team.xp}
              XP{"  "}•{"  "}#1
            </GrayText>
          </Animated.View>
        )}
      </Container>
    </Marker>
  );
};

export default PlayerMarker;
