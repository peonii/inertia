import styled from "@emotion/native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useRef, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { DimensionValue, View } from "react-native";
import MapView from "react-native-maps";
import { ENDPOINTS } from "../../api/constants";
import { fetchTypeSafe } from "../../api/fetch";
import LoadingGlyph from "../../components/loadingGlyph";
import LocationPickerSheet from "../../components/locationPickerSheet";
import { useAuth } from "../../context/AuthContext";
import { Game } from "../../types";
import { VerticalSpacer, formatDateLong } from "../../utilis";
import DateTimePicker from "@react-native-community/datetimepicker";

const Container = styled.View`
  height: 100%;
  width: 100%;
  padding: 30px;
  background-color: #252525;
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
  padding-top: 50px;
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
  start: string;
  end: string;
  lat: number;
  lng: number;
};

const GameDetailScreen: React.FC = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log(id);

  const { data, error } = useQuery({
    queryKey: [`game ${id}`],
    queryFn: () => fetchTypeSafe<Game>(ENDPOINTS.games.all + `/${id}`, authContext),
    staleTime: 1000 * 60,
  });

  if (error) {
    router.push("/error/" + error.message);
  }

  const [location, setLocation] = useState("");

  async function updateAdressText() {
    const adress = await mapRef.current.addressForCoordinate({
      latitude: gameForm.getValues("lat"),
      longitude: gameForm.getValues("lng"),
    });

    console.log(gameForm.getValues("lat"), gameForm.getValues("lng"));
    console.log(adress);

    if (adress.thoroughfare) setLocation(`${adress.thoroughfare}, ${adress.locality}`);
    else if (adress.subLocality) setLocation(`${adress.subLocality}, ${adress.locality}`);
    else setLocation(adress.locality);
  }

  function compareGameForms() {
    if (
      !gameForm.getValues().lat ||
      !gameForm.getValues().lng ||
      !defaultValues.current
    ) {
      return true;
    }
    if (
      gameForm.getValues().start === defaultValues.current.start &&
      gameForm.getValues().end === defaultValues.current.end &&
      gameForm.getValues().lat === defaultValues.current.lat &&
      gameForm.getValues().lng === defaultValues.current.lng
    ) {
      return true;
    } else {
      return false;
    }
  }

  const defaultValues = useRef({
    lat: 0,
    lng: 0,
    start: "",
    end: "",
  });
  const gameForm = useForm<GameFormData>();

  useEffect(() => {
    if (data) {
      gameForm.setValue("start", data.time_start);
      gameForm.setValue("end", data.time_end);
      gameForm.setValue("lat", data.loc_lat);
      gameForm.setValue("lng", data.loc_lng);
      updateAdressText();
      defaultValues.current = gameForm.getValues();
    }
  }, [data]);

  const sheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);

  const authContext = useAuth();

  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [isPickingTime, setIsPickingTime] = useState(false);
  const tempDate = useRef(new Date());

  return (
    <Container>
      {data ? (
        <BigTitle numberOfLines={1}>{data.name}</BigTitle>
      ) : (
        <Loading height={50} width={"90%"}></Loading>
      )}
      {data ? (
        <SmallTitle style={{ color: "#a5a5a5" }}>
          {data.official ? "Oficial " : "Unofficial "}game
        </SmallTitle>
      ) : (
        <Loading height={30} width={"50%"}></Loading>
      )}

      <VerticalSpacer height={50}></VerticalSpacer>

      <MediumTitle>Date</MediumTitle>
      {data ? (
        <Controller
          control={gameForm.control}
          name="start"
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PressableContainer
              onBlur={onBlur}
              onPress={() => {
                setIsPickingTime(false);
                setStartDatePickerVisible(true);
              }}
            >
              <SmallTitle style={{ color: "#a5a5a5" }}>
                Starts @ {formatDateLong(value)}
              </SmallTitle>
              <SmallTitle>Edit</SmallTitle>
              {startDatePickerVisible && (
                <DateTimePicker
                  themeVariant="dark"
                  mode={isPickingTime ? "time" : "date"}
                  value={new Date(value)}
                  onChange={(event) => {
                    if (event.type === "dismissed") {
                      setStartDatePickerVisible(false);
                      return;
                    }
                    if (isPickingTime) {
                      const date = tempDate.current;
                      const newValues = new Date(event.nativeEvent.timestamp);
                      date.setHours(newValues.getHours());
                      date.setMinutes(newValues.getMinutes());
                      onChange(date.toISOString());
                      // Check if there are no errors with start Date
                      if (date > new Date(gameForm.getValues("end"))) {
                        date.setHours(date.getHours() + 1);
                        gameForm.setValue("end", date.toISOString());
                      }
                      setStartDatePickerVisible(false);
                    } else {
                      tempDate.current = new Date(event.nativeEvent.timestamp);
                      setIsPickingTime(true);
                    }
                  }}
                ></DateTimePicker>
              )}
            </PressableContainer>
          )}
        ></Controller>
      ) : (
        <Loading height={30} width={"90%"}></Loading>
      )}

      <VerticalSpacer height={30}></VerticalSpacer>

      {data ? (
        <Controller
          control={gameForm.control}
          name="end"
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <PressableContainer
              onBlur={onBlur}
              onPress={() => {
                setIsPickingTime(false);
                setEndDatePickerVisible(true);
              }}
            >
              <SmallTitle style={{ color: "#a5a5a5" }}>
                Starts @ {formatDateLong(value)}
              </SmallTitle>
              <SmallTitle>Edit</SmallTitle>
              {endDatePickerVisible && (
                <DateTimePicker
                  mode={isPickingTime ? "time" : "date"}
                  value={new Date(value)}
                  onChange={(event) => {
                    if (event.type === "dismissed") {
                      setEndDatePickerVisible(false);
                      return;
                    }
                    if (isPickingTime) {
                      const date = tempDate.current;
                      const newValues = new Date(event.nativeEvent.timestamp);
                      date.setHours(newValues.getHours());
                      date.setMinutes(newValues.getMinutes());
                      onChange(date.toISOString());
                      // Check if there are no errors with start Date
                      if (date < new Date(gameForm.getValues("start"))) {
                        date.setHours(date.getHours() - 1);
                        gameForm.setValue("start", date.toISOString());
                      }
                      setEndDatePickerVisible(false);
                    } else {
                      tempDate.current = new Date(event.nativeEvent.timestamp);
                      setIsPickingTime(true);
                    }
                  }}
                ></DateTimePicker>
              )}
            </PressableContainer>
          )}
        ></Controller>
      ) : (
        <Loading height={30} width={"90%"}></Loading>
      )}

      <Divider></Divider>
      <MediumTitle>Location</MediumTitle>
      {location ? (
        <PressableContainer
          onPress={() => {
            mapRef.current.animateToRegion(
              {
                latitude: gameForm.getValues("lat"),
                longitude: gameForm.getValues("lng"),
                latitudeDelta: 0.1383,
                longitudeDelta: 0.06315,
              },
              0
            );

            sheetRef.current.snapToIndex(0);
          }}
        >
          <View>
            <SmallTitle style={{ color: "#a5a5a5" }}>{location}</SmallTitle>
            <SmallTitle>Edit</SmallTitle>
          </View>
        </PressableContainer>
      ) : (
        <Loading height={30} width={"50%"}></Loading>
      )}
      <ButtonsContainer>
        <PressableContainer
          onPress={async () => {
            if (!compareGameForms()) {
              await fetchTypeSafe<null>(ENDPOINTS.games.update(id), authContext, {
                method: "PATCH",
                body: JSON.stringify({
                  time_start: gameForm.getValues("start"),
                  time_end: gameForm.getValues("end"),
                  loc_lat: gameForm.getValues("lat"),
                  loc_lng: gameForm.getValues("lng"),
                }),
              });
              router.replace("/home");
              // TODO: Api to apply changes
            }
          }}
        >
          <ButtonView>
            <ButtonText>{compareGameForms() ? "Close" : "Save"}</ButtonText>
          </ButtonView>
        </PressableContainer>
        <PressableContainer
          onPress={() => {
            // TODO: Api to apply changes, start game
          }}
        >
          <ButtonView style={{ backgroundColor: "#439255" }}>
            <ButtonText>Start</ButtonText>
          </ButtonView>
        </PressableContainer>
      </ButtonsContainer>
      <LocationPickerSheet
        mapRef={mapRef}
        sheetRef={sheetRef}
        onAccept={async () => {
          const camera = await mapRef.current.getCamera();
          gameForm.setValue("lat", camera.center.latitude);
          gameForm.setValue("lng", camera.center.longitude);
          await updateAdressText();
        }}
        onCancel={() => {}}
        initialRegion={{
          lat: 52.22884197323852,
          lng: 21.003216436837576,
        }}
      ></LocationPickerSheet>
    </Container>
  );
};

export default GameDetailScreen;
