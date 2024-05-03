import styled from "@emotion/native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetModal,
} from "@gorhom/bottom-sheet";
import {
  BottomSheetMethods,
  BottomSheetModalMethods,
} from "@gorhom/bottom-sheet/lib/typescript/types";
import { router } from "expo-router";
import { LegacyRef, useCallback, useEffect, useState } from "react";
import { ActivityIndicator, useWindowDimensions } from "react-native";
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
  onAccept: () => Promise<void>;
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
  const [isMapActivity, setIsMapActivity] = useState(false);

  // {isActive ? (
  //   <PressableContainer onPress={onCancel}>
  //     <DarkFilter></DarkFilter>
  //   </PressableContainer>
  // ) : (
  //   ""
  // )}

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        enableTouchThrough={true}
        pressBehavior="close"
        appearsOnIndex={0}
        disappearsOnIndex={-1}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      snapPoints={["84%"]}
      ref={sheetRef}
      enablePanDownToClose={!isMapActivity}
      index={-1}
      backgroundComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: "#252525" }}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{ backgroundColor: "#fff" }}
      onAnimate={() => {
        //@ts-expect-error idk
        mapRef.current.setCamera({ zoom: 12 });
      }}
      style={{ zIndex: 1000 }}
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
            sheetRef.current.close();
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
            ref={mapRef}
            zoomTapEnabled={false}
            showsUserLocation={true}
            showsMyLocationButton={true}
            zoomControlEnabled={false}
            zoomEnabled={false}
            onDoublePress={() => {
              //@ts-expect-error zjebane to
              mapRef.current.getCamera().then((camera) => {
                switch (camera.zoom) {
                  case 12:
                    //@ts-expect-error zjebane to
                    mapRef.current.animateCamera(
                      { zoom: 14 },
                      { duration: 500 },
                    );
                    break;
                  case 14:
                    //@ts-expect-error zjebane to
                    mapRef.current.animateCamera(
                      { zoom: 16 },
                      { duration: 500 },
                    );
                    break;
                  case 16:
                    //@ts-expect-error zjebane to
                    mapRef.current.animateCamera(
                      { zoom: 18 },
                      { duration: 500 },
                    );
                    break;
                  default:
                    //@ts-expect-error zjebane to
                    mapRef.current.animateCamera(
                      { zoom: 12 },
                      { duration: 500 },
                    );
                }
              });
            }}
          ></MapView>
          {isMapActivity ? (
            <ActivityIndicator
              style={{ position: "absolute" }}
              size={"large"}
            ></ActivityIndicator>
          ) : (
            <Crosshair
              source={require("../../assets/map-crosshair.png")}
            ></Crosshair>
          )}
        </MapContainer>
        <PressableContainer
          onPress={async () => {
            setIsMapActivity(true);
            await onAccept().catch(() => {
              router.push("/error");
            });
            setIsActive(false);
            setIsMapActivity(false);
            //@ts-expect-error chuj wie co mu sie tu nie podoba
            sheetRef.current.close();
          }}
        >
          <NextButtonView>
            <MediumTitle>Done</MediumTitle>
          </NextButtonView>
        </PressableContainer>
      </Container>
    </BottomSheet>
  );
};

export default LocationPickerSheet;
