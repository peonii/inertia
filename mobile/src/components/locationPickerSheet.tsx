import styled from "@emotion/native";
import BottomSheet, { useBottomSheet } from "@gorhom/bottom-sheet";
import { BottomSheetMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import React, { LegacyRef, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Dimensions, View, useWindowDimensions } from "react-native";
import MapView from "react-native-maps";

const Container = styled.View`
  width: 100%;
  height: 100%;
  background-color: #252525;
`;

const SmallTitle = styled.Text`
  font-size: 20px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.3px;
`;

const PressableContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const ExitButton = styled.View`
  background-color: #434343;
  width: 30px;
  height: 30px;
  border-radius: 15px;
  align-items: center;
  justify-content: center;
`;

const ExitButtonText = styled.Text`
  font-size: 19px;
  font-family: Inter_600SemiBold;
  include-font-padding: false;
  vertical-align: middle;
  color: #929292;
  padding-bottom: 2px;
`;

const MapContainer = styled.View`
  height: 100%;
  width: 91%;
  margin: 16px;
  margin-bottom: 20px;
  border-radius: 10px;
  overflow: hidden;
  align-items: center;
  justify-content: center;
`;

const DarkFilter = styled.View`
  opacity: 0.4;
  background-color: #000000;
  width: 100%;
  height: 100%;
`;

const Crosshair = styled.Image`
  position: absolute;
  width: 100px;
  height: 35px;
`;

const NextButtonView = styled.View`
  align-items: center;
  justify-content: center;
  background-color: #3d3d3d;
  border-radius: 10px;
  width: 124px;
  height: 61px;
`;

const MediumTitle = styled.Text`
  font-size: 24px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.6px;
`;

type LocationPickerProps = {
  sheetRef: React.Ref<BottomSheetMethods>;
  onCancel: () => void;
  onAccept: () => void;
  mapRef: LegacyRef<MapView>;
  initialRegion: { lat: number; lng: number };
};

const LocationPickerSheet: React.FC<LocationPickerProps> = ({
  sheetRef,
  onAccept,
  onCancel,
  mapRef,
  initialRegion,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isMapActivity, setIsMapActivity] = useState(false);
  const currentRegion = useRef(initialRegion);
  function updateRegion(newRegion: { lat: number; lng: number }) {
    currentRegion.current = newRegion;
  }

  const screenSize = {
    width: Dimensions.get("screen").width,
    height: Dimensions.get("screen").height,
    position: "absolute" as "absolute" | "relative",
    bottom: 0,
    left: 0,
    Zindex: 10,
  };
  return (
    <View style={screenSize}>
      {isActive ? (
        <PressableContainer onPress={onCancel}>
          <DarkFilter></DarkFilter>
        </PressableContainer>
      ) : (
        ""
      )}
      <BottomSheet
        snapPoints={["85%"]}
        ref={sheetRef}
        enablePanDownToClose={true}
        index={-1}
        backgroundStyle={{ backgroundColor: "#252525" }}
        onChange={(index) => {
          setIsActive(index > -1);
        }}
      >
        <Container
          style={{
            alignItems: "center",
            height: Math.round(useWindowDimensions().height * 0.66),
          }}
        >
          <SmallTitle style={{ alignSelf: "flex-start", left: 16 }}>
            Select location
          </SmallTitle>
          <PressableContainer
            style={{ position: "absolute", right: 16 }}
            onPress={() => {
              onCancel();
              //@ts-expect-error chuj wie again
              sheetRef.current.snapToIndex(-1);
              setIsActive(false);
            }}
          >
            <ExitButton>
              <ExitButtonText>x</ExitButtonText>
            </ExitButton>
          </PressableContainer>
          <MapContainer>
            <MapView
              initialRegion={{
                latitude: initialRegion.lat,
                longitude: initialRegion.lng,
                latitudeDelta: 0.1383,
                longitudeDelta: 0.06315,
              }}
              style={{
                width: "100%",
                height: "100%",
              }}
              onRegionChange={({ latitude, longitude }) => {
                updateRegion({ lat: latitude, lng: longitude });
              }}
              ref={mapRef}
            ></MapView>
            {isMapActivity && <DarkFilter style={{ position: "absolute" }}></DarkFilter>}
            {isMapActivity ? (
              <ActivityIndicator
                style={{ position: "absolute" }}
                size={"large"}
              ></ActivityIndicator>
            ) : (
              <Crosshair source={require("../../assets/map-crosshair.png")}></Crosshair>
            )}
          </MapContainer>
          <PressableContainer
            onPress={async () => {
              setIsMapActivity(true);
              await onAccept();
              setIsActive(false);
              setIsMapActivity(false);
              //@ts-expect-error chuj wie co mu sie tu nie podoba
              sheetRef.current.snapToIndex(-1);
            }}
          >
            <NextButtonView>
              <MediumTitle>Done</MediumTitle>
            </NextButtonView>
          </PressableContainer>
        </Container>
      </BottomSheet>
    </View>
  );
};

export default LocationPickerSheet;
