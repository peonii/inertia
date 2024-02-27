import styled from "@emotion/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Easing, useWindowDimensions } from "react-native";
import { useForm, Controller } from "react-hook-form";
import DateTimePicker from "@react-native-community/datetimepicker";
import BottomSheet from "@gorhom/bottom-sheet";
import MapView, { Region } from "react-native-maps";
import { AuthContextType } from "../context/AuthContext";
import { fetchTypeSafe } from "../api/fetch";
import { ENDPOINTS } from "../api/constants";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatDate(dateString: string) {
  const date = new Date(dateString);
  let day: string = date.getDate().toString();
  switch (day) {
    case "1":
      day += "st";
      break;
    case "2":
      day += "nd";
      break;
    case "3":
      day += "rd";
      break;
    default:
      day += "th";
      break;
  }
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hour: string | number =
    date.getHours() < 12 ? date.getHours() : date.getHours() - 12;
  hour = hour.toString().length === 1 ? "0" + hour : hour;
  const idkHowToNameThis = date.getHours() < 12 ? "AM" : "PM";
  const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return `${day} ${month}, ${year}, ${hour}:${minutes} ${idkHowToNameThis}`;
}

function formatDateShort(dateString: string) {
  const date = new Date(dateString);
  let day: string = date.getDate().toString();
  switch (day) {
    case "1":
      day += "st";
      break;
    case "2":
      day += "nd";
      break;
    case "3":
      day += "rd";
      break;
    default:
      day += "th";
      break;
  }
  const month = months[date.getMonth()].substring(0, 3);
  return `${day} ${month}`;
}

function formatDateLong(dateString: string) {
  const date = new Date(dateString);
  let day: string = date.getDate().toString();
  switch (day) {
    case "1":
      day += "st";
      break;
    case "2":
      day += "nd";
      break;
    case "3":
      day += "rd";
      break;
    default:
      day += "th";
      break;
  }
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hour: string | number =
    date.getHours() < 12 ? date.getHours() : date.getHours() - 12;
  hour = hour.toString().length === 1 ? "0" + hour : hour;
  const idkHowToNameThis = date.getHours() < 12 ? "AM" : "PM";
  const minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return `${day} ${month.substring(0, 3)}, ${year}, ${hour}:${minutes} ${idkHowToNameThis}`;
}

type formStatus = "active" | "done" | "undone";

const Container = styled.View`
  width: 100%;
  height: 100%;
  background-color: #252525;
`;

const BigTitle = styled.Text`
  font-size: 40px;
  color: #ffffff;
  font-family: Inter_700Bold;
  letter-spacing: -1.9px;
  padding: 20px;
  padding-left: 27px;
`;

const MediumTitle = styled.Text`
  font-size: 24px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.6px;
`;

const MediumGrayTitle = styled.Text`
  font-size: 24px;
  color: #a5a5a5;
  font-family: Inter_500Medium;
  letter-spacing: -1.6px;
`;

const SmallTitle = styled.Text`
  font-size: 20px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.3px;
`;

const SmallGrayTitle = styled.Text`
  font-size: 20px;
  color: #7c7c7c;
  font-family: Inter_500Medium;
  letter-spacing: -1.6px;
`;

const ProgressTrackerContainer = styled.View`
  flex-direction: column;
  gap: 10px;
  padding-left: 29px;
`;

const StatusDotsContainer = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const StatusProgressText = styled.Text`
  font-size: 24px;
  color: #439255;
  font-family: Inter_500Medium;
  letter-spacing: -1.6px;
`;

const PressableContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

const NextButtonView = styled.View`
  align-items: center;
  justify-content: center;
  background-color: #3d3d3d;
  border-radius: 10px;
  width: 124px;
  height: 61px;
`;

const FieldPage = styled.View`
  width: 25%;
  height: 100%;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 20px;
`;

const GameNameInput = styled.TextInput`
  margin-top: 15px;
  align-self: center;
  width: 326px;
  height: 53px;
  padding-horizontal: 15px;
  vertical-align: middle;
  include-font-padding: false;
  border-radius: 10px;
  font-size: 20px;
  font-family: Inter_500Medium;
  background-color: #323232;
  color: #ffffff;
  letter-spacing: -1.6px;
`;

const Divider = styled.View`
  width: 320px;
  margin-vertical: 15px;
  height: 1px;
  background-color: #3d3d3d;
  align-self: center;
`;

const CurrentDetails = styled.View`
  top: 80px;
  right: 30px;
  align-items: flex-end;
  position: absolute;
`;

const ErrorMessage = styled.Text`
  font-size: 18px;
  font-family: Inter_600SemiBold;
  color: #dd3333;
  letter-spacing: -1.2px;
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

const DarkFilter = styled.View`
  opacity: 0.4;
  background-color: #000000;
  width: 100%;
  height: 100%;
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

type StatusDotProps = {
  status: formStatus;
};

const StatusDot: React.FC<StatusDotProps> = ({ status }) => {
  const width = useRef(new Animated.Value(status == "active" ? 1 : 0)).current;

  function changeWidth(value: number) {
    Animated.timing(width, {
      toValue: value,
      useNativeDriver: false,
      duration: 350,
      easing: Easing.out(Easing.cubic),
    }).start();
  }

  function expand() {
    changeWidth(1);
  }

  function collapse() {
    changeWidth(0);
  }

  useEffect(() => {
    if (status === "active") {
      expand();
    } else {
      collapse();
    }
  }, [status]);

  return (
    <Animated.View
      style={{
        backgroundColor: status == "undone" ? "#3d3d3d" : "#439255",
        width: width.interpolate({ inputRange: [0, 1], outputRange: [12, 88] }),
        height: 12,
        borderRadius: 10,
      }}
    ></Animated.View>
  );
};

type ProgressTrackerProps = {
  statusArray: formStatus[];
};

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ statusArray }) => {
  const statusList = statusArray.map((status, index) => {
    return <StatusDot key={index} status={status}></StatusDot>;
  });
  const done = statusArray.filter((status) => status == "done").length + 1;

  return (
    <ProgressTrackerContainer>
      <StatusDotsContainer>{statusList}</StatusDotsContainer>
      <StatusProgressText>
        {done > statusList.length ? "All done!" : `${done}/${statusArray.length}`}
      </StatusProgressText>
    </ProgressTrackerContainer>
  );
};

type GameCreationViewProps = {
  closeView: () => void;
  userId: string;
  authContext: AuthContextType;
};

type NameFormData = {
  name: string;
};

type DateFormData = {
  startDate: string;
  endDate: string;
};

type LocationFormData = {
  location: {
    lat: number;
    lng: number;
  };
};

const GameCreationView: React.FC<GameCreationViewProps> = ({
  closeView,
  userId,
  authContext,
}) => {
  const [startDatePickerVisible, setStartDatePickerVisible] = useState(false);
  const [endDatePickerVisible, setEndDatePickerVisible] = useState(false);
  const [isPickingTime, setIsPickingTime] = useState(false);

  //3 forms, each for every screen
  const nameForm = useForm<NameFormData>({
    defaultValues: {
      name: "",
    },
  });

  const endDate = new Date();
  endDate.setHours(endDate.getHours() + 6);

  const dateForm = useForm<DateFormData>({
    defaultValues: {
      startDate: new Date().toISOString(),
      endDate: endDate.toISOString(),
    },
  });

  const tempDate = useRef(new Date());

  const locationForm = useForm<LocationFormData>({
    defaultValues: {
      location: {
        lat: 52.22884197323852,
        lng: 21.003216436837576,
      },
    },
  });

  const currentScreen = useRef(new Animated.Value(0)).current;
  function scrollTo(index: number) {
    Animated.timing(currentScreen, {
      toValue: index,
      useNativeDriver: false,
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }).start();
  }

  const [statusArray, setStatusArray] = useState([
    "active",
    "undone",
    "undone",
  ] as formStatus[]);

  useEffect(() => {
    if (statusArray.indexOf("active") >= 0) {
      scrollTo(statusArray.indexOf("active"));
    } else {
      scrollTo(3);
    }
  }, [statusArray]);

  const slideInValues = useRef([new Animated.Value(0), new Animated.Value(0)]).current;

  function scale(index: number) {
    return slideInValues[index].interpolate({ inputRange: [0, 1], outputRange: [30, 0] });
  }

  function reverse(index: number) {
    return slideInValues[index].interpolate({ inputRange: [0, 1], outputRange: [1, 0] });
  }

  function reverseScale(index: number) {
    return slideInValues[index].interpolate({
      inputRange: [0, 1],
      outputRange: [-30, 0],
    });
  }

  function slide(index: number, direction: "in" | "out") {
    Animated.timing(slideInValues[index], {
      toValue: direction === "in" ? 1 : 0,
      useNativeDriver: false,
      duration: 600,
      easing: Easing.out(Easing.cubic),
    }).start();
  }

  async function goPrevious() {
    const lastActiveIndex = statusArray.indexOf("active");
    if (lastActiveIndex === 1) {
      dateForm.reset();
      slide(0, "out");
    }

    if (lastActiveIndex === 2) {
      locationForm.reset();
      updateAdressText();
      slide(1, "out");
    }

    if (lastActiveIndex < 0) {
      slide(0, "in");
      slide(1, "in");
      setStatusArray(["done", "done", "active"]);
      return;
    }
    if (lastActiveIndex == 0) {
      closeView();
    }

    setStatusArray((prev) => {
      const lastActiveIndex = prev.indexOf("active");
      const newArray = [...prev];
      newArray[lastActiveIndex] = "undone";
      newArray[lastActiveIndex - 1] = "active";
      return newArray;
    });
  }

  async function createGame(gameData) {
    console.log("mega wtf");
    await fetchTypeSafe(ENDPOINTS.games.create, authContext, {
      method: "POST",
      body: JSON.stringify(gameData),
    }).catch((error) => {
      console.log(error);
    });
  }

  async function goNext() {
    if (statusArray[statusArray.length - 1] == "done") {
      // TODO send post request to database
      const data = {
        name: nameForm.getValues("name"),
        host_id: userId,
        time_start: dateForm.getValues("startDate"),
        time_end: dateForm.getValues("endDate"),
        loc_lat: locationForm.getValues("location").lat,
        loc_lng: locationForm.getValues("location").lng,
      };
      console.log("wtf");
      await createGame(data);
      closeView();
      return;
    }
    if (statusArray.indexOf("active") < 2) slide(statusArray.indexOf("active"), "in");
    else {
      slide(0, "out");
      slide(1, "out");
    }

    if (statusArray[statusArray.length - 1] === "active") {
      setStatusArray(["done", "done", "done"]);
      return;
    }

    setStatusArray((prev) => {
      const lastActiveIndex = prev.indexOf("active");
      const newArray = [...prev];
      newArray[lastActiveIndex] = "done";
      newArray[lastActiveIndex + 1] = "active";
      return newArray;
    });
  }

  const animTextStyle = {
    fontSize: 20,
    fontFamily: "Inter_500Medium",
    color: "#a5a5a5",
    letterSpacing: -1.3,
  };

  const [isLocationPickerVisible, setIsLocationPickerVisible] = useState(false);

  const locationPickerRef = useRef<BottomSheet>(null);

  const handleSheetChanges = useCallback((index: number) => {
    index === -1 && setIsLocationPickerVisible(false);
  }, []);

  const currentMapPosition = useRef(locationForm.getValues("location"));

  function updatePosition(region: Region) {
    currentMapPosition.current = { lat: region.latitude, lng: region.longitude };
  }

  const mapRef = useRef<MapView>(null);
  const [addressText, setAdressText] = useState("");

  const [isMapActivity, setIsMapActivity] = useState(false);

  async function updateAdressText() {
    const adress = await mapRef.current.addressForCoordinate({
      latitude: locationForm.getValues("location").lat,
      longitude: locationForm.getValues("location").lng,
    });
    if (adress.subLocality) setAdressText(`${adress.subLocality}, ${adress.locality}`);
    else setAdressText(adress.locality);
  }
  useEffect(() => {
    (async () => {
      updateAdressText();
    })();
  }, []);

  return (
    <Container>
      <BigTitle>Host your game</BigTitle>
      <ProgressTracker statusArray={statusArray}></ProgressTracker>

      <CurrentDetails>
        <Animated.Text
          style={[[animTextStyle], { opacity: slideInValues[0], marginTop: scale(0) }]}
        >
          {nameForm.getValues("name")}
        </Animated.Text>
        <Animated.Text
          style={[[animTextStyle], { opacity: slideInValues[1], marginTop: scale(1) }]}
        >
          Starts @ {formatDateShort(dateForm.getValues("startDate"))}
        </Animated.Text>
      </CurrentDetails>
      <Animated.View
        style={{
          flexDirection: "row",
          height: 320,
          width: "400%",
          position: "absolute",
          top: "23%",
          left: currentScreen.interpolate({
            inputRange: [0, 3],
            outputRange: ["-0%", "-300%"],
          }),
        }}
      >
        {/* Page 1 */}
        <FieldPage>
          <SmallGrayTitle>What's your game called?</SmallGrayTitle>
          <Controller
            control={nameForm.control}
            rules={{
              required: "Name is required",
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <GameNameInput
                placeholderTextColor={"#7c7c7c"}
                placeholder="Name"
                onBlur={onBlur}
                onChangeText={onChange}
                value={value}
                onSubmitEditing={nameForm.handleSubmit(goNext)}
              />
            )}
            name="name"
          ></Controller>
          <ErrorMessage>
            {nameForm.formState.errors.name && nameForm.formState.errors.name.message}
          </ErrorMessage>
        </FieldPage>

        {/* Page 2 */}
        <FieldPage>
          <SmallGrayTitle>When is it starting?</SmallGrayTitle>
          <Controller
            control={dateForm.control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <PressableContainer
                style={{ alignItems: "flex-start" }}
                onBlur={onBlur}
                onPress={() => {
                  setIsPickingTime(false);
                  setStartDatePickerVisible(true);
                }}
              >
                <MediumGrayTitle>Start date</MediumGrayTitle>
                <MediumTitle>{formatDate(value)}</MediumTitle>
                <MediumGrayTitle style={{ color: "#7c7c7c" }}>Edit</MediumGrayTitle>
                {startDatePickerVisible && (
                  <DateTimePicker
                    mode={isPickingTime ? "time" : "date"}
                    value={new Date(value)}
                    onChange={(event) => {
                      if (event.type == "dismissed") {
                        console.log("dismissed");
                        setStartDatePickerVisible(false);
                        return;
                      }
                      if (isPickingTime) {
                        const date = tempDate.current;
                        const newValues = new Date(event.nativeEvent.timestamp);
                        date.setHours(newValues.getHours());
                        date.setMinutes(newValues.getMinutes());
                        onChange(date);
                        // Check if there are no errors with end Date
                        if (date > new Date(dateForm.getValues("endDate"))) {
                          date.setHours(date.getHours() + 1);
                          dateForm.setValue("endDate", date.toISOString());
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
            name="startDate"
          ></Controller>
          <Divider></Divider>
          <Controller
            control={dateForm.control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <PressableContainer
                style={{ alignItems: "flex-start" }}
                onBlur={onBlur}
                onPress={() => {
                  setIsPickingTime(false);
                  setEndDatePickerVisible(true);
                }}
              >
                <MediumGrayTitle>End date</MediumGrayTitle>
                <MediumTitle>{formatDate(value)}</MediumTitle>
                <MediumGrayTitle style={{ color: "#7c7c7c" }}>Edit</MediumGrayTitle>
                {endDatePickerVisible && (
                  <DateTimePicker
                    mode={isPickingTime ? "time" : "date"}
                    value={new Date(value)}
                    onChange={(event) => {
                      if (event.type === "dismissed") {
                        console.log("dismissed");
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
                        if (date < new Date(dateForm.getValues("startDate"))) {
                          date.setHours(date.getHours() - 1);
                          dateForm.setValue("startDate", date.toISOString());
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
            name="endDate"
          ></Controller>
        </FieldPage>

        {/* Page 3 */}
        <FieldPage>
          <SmallGrayTitle>Where is it starting?</SmallGrayTitle>
          <PressableContainer
            style={{ alignItems: "flex-start", width: "100%" }}
            onPress={() => {
              mapRef.current.animateToRegion(
                {
                  latitude: locationForm.getValues("location").lat,
                  longitude: locationForm.getValues("location").lng,
                  latitudeDelta: 0.1383,
                  longitudeDelta: 0.06315,
                },
                0
              );
              locationPickerRef.current.expand();
              setIsLocationPickerVisible(true);
            }}
          >
            <MediumGrayTitle>Location</MediumGrayTitle>
            <MediumTitle>{addressText}</MediumTitle>
            <MediumGrayTitle style={{ paddingTop: 10 }}>Edit</MediumGrayTitle>
          </PressableContainer>
        </FieldPage>

        {/* Page 4 */}
        <FieldPage>
          <SmallGrayTitle>Does this look right?</SmallGrayTitle>
          <Animated.View
            style={{ opacity: reverse(0), top: reverseScale(0), paddingTop: 70 }}
          >
            <MediumTitle style={{ fontFamily: "Inter_700Bold", paddingBottom: 15 }}>
              {nameForm.getValues("name")}
            </MediumTitle>
            <SmallGrayTitle style={{ color: "#a5a5a5" }}>
              Starts @ {formatDateLong(dateForm.getValues("startDate"))}
            </SmallGrayTitle>
            <SmallGrayTitle style={{ color: "#a5a5a5", paddingBottom: 15 }}>
              Ends @ {formatDateLong(dateForm.getValues("endDate"))}
            </SmallGrayTitle>
            <SmallGrayTitle style={{ color: "#a5a5a5" }}>{addressText}</SmallGrayTitle>
          </Animated.View>
        </FieldPage>
      </Animated.View>

      <PressableContainer
        style={{
          position: "absolute",
          bottom: "28%",
          paddingLeft: 5,
          alignSelf: "center",
        }}
        onPress={(() => {
          switch (statusArray.indexOf("active")) {
            case 0:
              return nameForm.handleSubmit(goNext);
            case 1:
              return dateForm.handleSubmit(goNext);
            case 2:
              return locationForm.handleSubmit(goNext);
            case -1:
              return goNext;
          }
        })()}
      >
        <NextButtonView>
          <MediumTitle>
            {statusArray[statusArray.length - 1] === "done" ? "Create" : "Next"}
          </MediumTitle>
        </NextButtonView>
      </PressableContainer>
      <PressableContainer
        style={{ position: "absolute", bottom: "28%" }}
        onPress={goPrevious}
      >
        {/* I know its a previous button stfu */}
        <NextButtonView style={{ backgroundColor: "transparent" }}>
          <SmallGrayTitle>
            {statusArray.indexOf("active") !== 0 ? "Previous" : "Cancel"}
          </SmallGrayTitle>
        </NextButtonView>
      </PressableContainer>
      {isLocationPickerVisible && (
        <PressableContainer
          style={{
            height: 3000,
            width: 3000,
            position: "absolute",
            bottom: 0,
          }}
          onPressOut={() => {
            locationPickerRef.current.close();
            setIsLocationPickerVisible(false);
          }}
        >
          <DarkFilter></DarkFilter>
        </PressableContainer>
      )}
      {
        <BottomSheet
          snapPoints={["100%"]}
          ref={locationPickerRef}
          onChange={handleSheetChanges}
          enablePanDownToClose={true}
          index={-1}
          backgroundStyle={{ backgroundColor: "#252525" }}
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
                locationPickerRef.current.close();
                setIsLocationPickerVisible(false);
              }}
            >
              <ExitButton>
                <ExitButtonText>x</ExitButtonText>
              </ExitButton>
            </PressableContainer>
            <MapContainer>
              <MapView
                initialRegion={{
                  latitude: locationForm.getValues("location").lat,
                  longitude: locationForm.getValues("location").lng,
                  latitudeDelta: 0.1383,
                  longitudeDelta: 0.06315,
                }}
                style={{
                  width: "100%",
                  height: "100%",
                }}
                onRegionChange={updatePosition}
                ref={mapRef}
              ></MapView>
              {isMapActivity && (
                <DarkFilter style={{ position: "absolute" }}></DarkFilter>
              )}
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
                locationForm.setValue("location", currentMapPosition.current);
                updateAdressText();
                setIsLocationPickerVisible(false);
                locationPickerRef.current.forceClose();
                setIsMapActivity(false);
              }}
            >
              <NextButtonView>
                <MediumTitle>Done</MediumTitle>
              </NextButtonView>
            </PressableContainer>
          </Container>
        </BottomSheet>
      }
    </Container>
  );
};

export default GameCreationView;
