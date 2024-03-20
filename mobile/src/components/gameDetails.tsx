import { View, DimensionValue } from "react-native";
import { useAuth } from "../context/AuthContext";
import { fetchTypeSafe } from "../api/fetch";
import { ENDPOINTS } from "../api/constants";
import { useQuery } from "@tanstack/react-query";
import { Game } from "../types";
import styled from "@emotion/native";
import LoadingGlyph from "./loadingGlyph";
import { useEffect, useRef, useState } from "react";
import { VerticalSpacer, formatDateLong } from "../utilis";
import LocationPickerSheet from "./locationPickerSheet";
import MapView from "react-native-maps";
import BottomSheet from "@gorhom/bottom-sheet";
import { useForm } from "react-hook-form";

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

const ButtonsContainer = styled.View`
  flex-direction: row;
  gap: 20px;
  align-self: center;
`;

const ButtonView = styled.View`
  width: 124px;
  height: 61px;
  align-items: center;
  justify-content: center;
  background-color: #3d3d3d;
  border-radius: 10px;
`;

const ButtonText = styled.Text`
  font-size: 24px;
  font-family: Inter_700Bold;
  color: #fff;
  letter-spacing: -1.6px;
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

type LoadingProps = { width: DimensionValue; height: DimensionValue };

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

type GameFormData = {
  date: {
    start: string;
    end: string;
  };
  location: {
    lat: number;
    lng: number;
  };
};

const GameDetailScreen: React.FC<GameDetailsProps> = ({ id }) => {
  const { data, error } = useQuery({
    queryKey: ["game"],
    queryFn: () => fetchTypeSafe<Game>(ENDPOINTS.games.all + `\\${id}`, authContext),
    staleTime: 1000 * 60,
  });

  const [location, setLocation] = useState("");

  async function updateAdressText() {
    const adress = await mapRef.current.addressForCoordinate({
      latitude: gameForm.getValues("location").lat,
      longitude: gameForm.getValues("location").lng,
    });
    if (adress.subLocality) setLocation(`${adress.subLocality}, ${adress.locality}`);
    else setLocation(adress.locality);
  }

  function compareGameForms() {
    if (!gameForm.getValues().location || !defaultValues.current) {
      return false;
    }
    if (
      gameForm.getValues().date.start === defaultValues.current.date.start &&
      gameForm.getValues().date.end === defaultValues.current.date.end &&
      gameForm.getValues().location.lat === defaultValues.current.location.lat &&
      gameForm.getValues().location.lng === defaultValues.current.location.lng
    ) {
      return true;
    } else {
      return false;
    }
  }

  const defaultValues = useRef({
    location: { lat: 0, lng: 0 },
    date: { start: "", end: "" },
  });
  const gameForm = useForm<GameFormData>();
  useEffect(() => {
    if (data) {
      gameForm.setValue("date", {
        start: data.time_start,
        end: data.time_end,
      });
      gameForm.setValue("location", { lat: data.loc_lat, lng: data.loc_lng });
      updateAdressText();
      defaultValues.current = gameForm.getValues();
    }
  }, [data]);

  const sheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  const authContext = useAuth();

  return (
    <Container>
      {data ? (
        <BigTitle numberOfLines={1}>{data.name}</BigTitle>
      ) : (
        <Loading height={50} width={"90%"}></Loading>
      )}
      {data ? (
        <SmallTitle style={{ color: "#a5a5a5" }}>
          {data.official ? "Oficial " : "Not official "}game
        </SmallTitle>
      ) : (
        <Loading height={30} width={"50%"}></Loading>
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
          <Loading height={30} width={"90%"}></Loading>
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
          <Loading height={30} width={"90%"}></Loading>
        )}
      </PressableContainer>
      <Divider></Divider>
      <MediumTitle>Location</MediumTitle>
      <PressableContainer
        onPress={() => {
          sheetRef.current.snapToIndex(0);
        }}
      >
        {location ? (
          <View>
            <SmallTitle style={{ color: "#a5a5a5" }}>{location}</SmallTitle>
            <SmallTitle>Edit</SmallTitle>
          </View>
        ) : (
          <Loading height={30} width={"50%"}></Loading>
        )}
      </PressableContainer>
      <ButtonsContainer>
        <PressableContainer>
          <ButtonView>
            <ButtonText style={compareGameForms() ? { color: "#7c7c7c" } : {}}>
              Save
            </ButtonText>
          </ButtonView>
        </PressableContainer>
      </ButtonsContainer>
      <LocationPickerSheet
        mapRef={mapRef}
        sheetRef={sheetRef}
        onAccept={async () => {
          sheetRef.current.forceClose();
          const camera = await mapRef.current.getCamera();
          gameForm.setValue("location", {
            lat: camera.center.latitude,
            lng: camera.center.longitude,
          });
          await updateAdressText();
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
