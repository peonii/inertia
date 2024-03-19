import { View } from "react-native";
import { useAuth } from "../context/AuthContext";
import { fetchTypeSafe } from "../api/fetch";
import { ENDPOINTS } from "../api/constants";
import { useQuery } from "@tanstack/react-query";
import { Game } from "../types";
import styled from "@emotion/native";
import LoadingGlyph from "./loadingGlyph";
import { useRef, useState } from "react";
import { VerticalSpacer, formatDateLong } from "../utilis";
import LocationPickerSheet from "./locationPickerSheet";
import MapView from "react-native-maps";
import BottomSheet from "@gorhom/bottom-sheet";

type GameDetailsProps = { id: string };

const Container = styled.View`
  flex: 1;
  height: 100%;
  width: 100%;
  padding: 30px;
`;

const BigTitle = styled.Text`
  font-size: 40px;
  color: #fff;
  font-family: Inter_700Bold;
  letter-spacing: -1.9px;
`;

const MediumTitle = styled.Text`
  font-family: Inter_700Bold;
  font-size: 24px;
  color: #fff;
  letter-spacing: -1.6px;
  padding: 3px 0;
`;

const SmallTitle = styled.Text`
  font-family: Inter_500Medium;
  font-size: 16px;
  color: #fff;
  letter-spacing: -1.2px;
`;

const ButtonContainer = styled.Button`
  width: 124px;
  height: 61px;
`;

const PressableContainer = styled.Pressable`
  align-items: flex-start;
  justify-content: flex-start;
`;

const Divider = styled.View`
  width: 100%;
  height: 1px;
  background-color: #3d3d3d;
  padding: 0px -5px;
  margin: 20px 0;
`;

type LoadingProps = { width: number; height: number };

const Loading: React.FC<LoadingProps> = ({ width, height }) => {
  return (
    <View
      style={{
        width: width,
        height: height,
        borderRadius: 7,
        overflow: "hidden",
        padding: 1,
      }}
    >
      <LoadingGlyph />
    </View>
  );
};

const GameDetailScreen: React.FC<GameDetailsProps> = ({ id }) => {
  const { data, isPending, error } = useQuery({
    queryKey: ["game"],
    queryFn: () => fetchTypeSafe<Game>(ENDPOINTS.games.all + `\\${id}`, authContext),
    staleTime: 1000 * 60,
  });

  const [location, setLocation] = useState("Metro Bemowo, Warszawa");

  const sheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  const authContext = useAuth();

  return (
    <Container>
      {data ? (
        <BigTitle numberOfLines={1}>{data.name}</BigTitle>
      ) : (
        <Loading height={50} width={300}></Loading>
      )}
      {data ? (
        <SmallTitle style={{ color: "#a5a5a5" }}>
          {data.official ? "Oficial " : "Not official "}game
        </SmallTitle>
      ) : (
        <Loading height={30} width={300}></Loading>
      )}

      <VerticalSpacer height={50}></VerticalSpacer>

      <MediumTitle>Date</MediumTitle>
      <PressableContainer>
        {data ? (
          <View>
            <SmallTitle style={{ color: "#a5a5a5" }}>
              Starts @ {formatDateLong(data.time_start)}
            </SmallTitle>
            <SmallTitle>Edit</SmallTitle>
          </View>
        ) : (
          <Loading height={10} width={300}></Loading>
        )}
      </PressableContainer>

      <VerticalSpacer height={30}></VerticalSpacer>

      <PressableContainer>
        {data ? (
          <View>
            <SmallTitle style={{ color: "#a5a5a5" }}>
              Ends @ {formatDateLong(data?.time_end)}
            </SmallTitle>
            <SmallTitle>Edit</SmallTitle>
          </View>
        ) : (
          <Loading height={10} width={300}></Loading>
        )}
      </PressableContainer>
      <Divider></Divider>
      <MediumTitle>Location</MediumTitle>
      <PressableContainer
        onPress={() => {
          sheetRef.current.expand();
        }}
      >
        {location ? (
          <View>
            <SmallTitle style={{ color: "#a5a5a5" }}>{location}</SmallTitle>
            <SmallTitle>Edit</SmallTitle>
          </View>
        ) : (
          <Loading height={50} width={300}></Loading>
        )}
      </PressableContainer>
      <LocationPickerSheet
        mapRef={mapRef}
        sheetRef={sheetRef}
        onAccept={() => {
          sheetRef.current.forceClose();
        }}
        onCancel={() => {
          sheetRef.current.forceClose();
        }}
        initialRegion={{
          lat: 52.22884197323852,
          lng: 21.003216436837576,
        }}
      ></LocationPickerSheet>
    </Container>
  );
};

export default GameDetailScreen;
