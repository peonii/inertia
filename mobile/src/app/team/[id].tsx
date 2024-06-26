import styled from "@emotion/native";
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import MapView from "react-native-maps";
import { fetchTypeSafe } from "../../api/fetch";
import {
  ActiveQuest,
  LocationPayload,
  Powerup,
  Team,
  WsMessage,
} from "../../types";
import { ENDPOINTS } from "../../api/constants";
import { AuthContextType, useAuth } from "../../context/AuthContext";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  TextInput,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { FlatList, Text } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import customMapTheme from "../../context/customMap";
import PlayerMarker from "../../components/playerMarker";
import { QuestItem } from "../../components/teamDetail/quest";
import { isVetoPeriodActive } from "../../utilis";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import PowerupIndicator from "../../components/teamDetail/powerupIndicator";
import { Picker } from "@react-native-picker/picker";

const FullScreenView = styled.View`
  flex: 1;
`;

const TeamDetailContainer = styled.View`
  padding-left: 20px;
  padding-right: 20px;
`;

const TeamHeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const TeamBalance = styled.Text`
  font-size: 46px;
  font-family: Inter_700Bold;
  letter-spacing: -2.3px;
  color: #ffffff;
  text-align: right;
`;

const TeamHeader = styled.Text`
  font-size: 28px;
  font-family: Inter_700Bold;
  letter-spacing: -1.8px;
  color: #ffffff;
`;

const TeamSubheader = styled.Text`
  font-size: 17px;
  font-family: Inter_400Regular;
  letter-spacing: -1.2px;
  color: #ffffff;
  opacity: 0.5;
`;

const TeamSectionHeader = styled.Text`
  font-size: 17px;
  font-family: Inter_700Bold;
  letter-spacing: -1.2px;
  color: #ffffff;
  opacity: 0.5;
`;

const TeamQuestContainer = styled.View`
  background-color: #323232;
  border-radius: 10px;
`;

const PowerupsContainer = styled.View`
  background-color: #323232;
  border-radius: 10px;
  flex-direction: row;
  justify-content: space-between;
  padding: 0px 20px;
`;

const SideQuestGenerationButton = styled.Pressable`
  background-color: #3a3a3a;
  border-radius: 10px;
  padding: 10px;
`;

const PowerupContainer = styled.Pressable`
  border-radius: 10px;
  padding: 10px;
  flex: 1;
  align-items: center;
`;

const PowerupTitle = styled.Text`
  font-size: 17px;
  font-family: Inter_700Bold;
  letter-spacing: -1.2px;
  color: #ffffff;
`;

const PowerupPrice = styled.Text`
  font-size: 17px;
  font-family: Inter_400Regular;
  letter-spacing: -1.2px;
  color: #aaaaaa;
  opacity: 0.7;
`;

const PowerupImage = styled.Image`
  width: 70px;
  height: 70px;
  margin-bottom: 10px;
`;

const PowerupIndicatorsContainer = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 40px;
  padding: 0 50px;
  width: 100%;
`;

const CatchButton = styled.Pressable`
  align-self: center;
  width: 195px;
  height: 60px;
  margin-top: 50px;
  background-color: #3a3a3a;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
`;

const CatchButtonText = styled.Text`
  font-size: 24px;
  font-family: Inter_700Bold;
  letter-spacing: -1.2px;
  color: #ffffff;
`;

const LOCATION_TASK_NAME = "inertia-location-task";
const POWERUP_DATA = {
  freeze_hunters: {
    price: 1000,
  },
  reveal_hunters: {
    price: 400,
  },
  hide_tracker: {
    price: 500,
  },
  hunt: {
    price: 200,
  },
  freeze_runners: {
    price: 1000,
  },
  blacklist: {
    price: 600,
  },
};

type TicketType = "bus" | "tram" | "m1" | "m2" | "km" | "wkd";
const prices: Record<TicketType, number> = {
  bus: 20,
  tram: 30,
  m1: 70,
  m2: 60,
  km: 70,
  wkd: 40,
};

const TeamDetailView: React.FC<{
  team: Team;
  refetchTeam: () => Promise<void>;
}> = ({ team, refetchTeam }) => {
  const authCtx = useAuth();

  // this is a GREAT way to handle this
  const [isBuyingTickets, setIsBuyingTickets] = useState(false);
  const [ticketAmount, setTicketAmount] = useState(1);
  const [ticketType, setTicketType] = useState<TicketType>("bus");

  const questsQuery = useQuery<ActiveQuest[], Error>({
    queryKey: ["quests", team.id],
    queryFn: async () => {
      const resp = await fetchTypeSafe<ActiveQuest[]>(
        ENDPOINTS.teams.quests(team.id),
        authCtx,
      );

      return resp;
    },
  });

  const sideQuestMutation = useMutation({
    mutationFn: async () => {
      await fetchTypeSafe<null>(
        ENDPOINTS.teams.generate_side(team.id),
        authCtx,
        {
          method: "POST",
        },
      );
    },
  });

  const completeQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      await fetchTypeSafe<null>(ENDPOINTS.quests.complete(questId), authCtx, {
        method: "POST",
      });
    },
  });

  const vetoQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      await fetchTypeSafe<null>(ENDPOINTS.quests.veto(questId), authCtx, {
        method: "POST",
      });
    },
  });

  function buyPowerup(type: string) {
    const powerup = POWERUP_DATA[type];

    if (team.balance < powerup.price) {
      Alert.alert(
        "Not enough balance",
        "You don't have enough balance to buy this powerup.",
      );
      return;
    }

    Alert.alert(
      "Buy Powerup",
      `Are you sure you want to buy this powerup for $${powerup.price}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Buy",
          onPress: async () => {
            await fetchTypeSafe<null>(ENDPOINTS.powerups.buy, authCtx, {
              method: "POST",
              body: JSON.stringify({ type, caster_id: team.id }),
            });
            refetchTeam();
          },
        },
      ],
    );
  }

  return (
    <TeamDetailContainer>
      <TeamHeaderContainer style={{ alignItems: "flex-start" }}>
        <View>
          <TeamHeader>{team.name}</TeamHeader>
          <TeamSubheader>
            {team.is_runner ? "Runner" : "Hunter"}
            {"  "}•{"  "}
            {team.xp}XP
          </TeamSubheader>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <TeamBalance>${team.balance}</TeamBalance>
          {team.is_runner && (
            <Pressable
              style={{
                padding: 6,
                backgroundColor: "#3a3a3a",
                borderRadius: 10,
              }}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsBuyingTickets((t) => !t);
              }}
            >
              <Text
                style={{
                  fontFamily: "Inter_400Regular",
                  color: "#ffffff",
                  fontSize: 14,
                  letterSpacing: -0.6,
                }}
              >
                Tickets
              </Text>
            </Pressable>
          )}
        </View>
      </TeamHeaderContainer>
      {isBuyingTickets ? (
        <Pressable
          onPress={() => {
            Keyboard.dismiss();
          }}
        >
          <TeamSectionHeader>TICKETS</TeamSectionHeader>
          <TextInput
            style={{
              backgroundColor: "#3a3a3a",
              color: "#ffffff",
              padding: 10,
              borderRadius: 10,
              marginBottom: 10,
              fontSize: 18,
            }}
            placeholder="Amount"
            keyboardType="number-pad"
            onChangeText={(text) => {
              if (parseInt(text)) {
                setTicketAmount(parseInt(text));
              } else {
                setTicketAmount(0);
              }
            }}
          />
          <Picker
            selectedValue={ticketType}
            onValueChange={(itemValue) => setTicketType(itemValue)}
            style={{
              backgroundColor: "#3a3a3a",
              color: "#ffffff",
              padding: 10,
              borderRadius: 10,
              marginBottom: 10,
              fontSize: 18,
            }}
            itemStyle={{ color: "#ffffff" }}
          >
            <Picker.Item style={{ color: "#ffffff" }} label="Bus" value="bus" />
            <Picker.Item
              style={{ color: "#ffffff" }}
              label="Tram"
              value="tram"
            />
            <Picker.Item style={{ color: "#ffffff" }} label="M1" value="m1" />
            <Picker.Item style={{ color: "#ffffff" }} label="M2" value="m2" />
            <Picker.Item style={{ color: "#ffffff" }} label="KM" value="km" />
            <Picker.Item style={{ color: "#ffffff" }} label="WKD" value="wkd" />
          </Picker>

          <Pressable
            style={{
              padding: 10,
              backgroundColor: "#3a3a3a",
              borderRadius: 10,
              marginBottom: 10,
            }}
            onPress={async () => {
              if (ticketAmount < 1) {
                Alert.alert(
                  "Invalid amount",
                  "You must buy at least 1 ticket.",
                );
                return;
              }

              await fetchTypeSafe<null>(
                ENDPOINTS.teams.buy_ticket(team.id),
                authCtx,
                {
                  method: "POST",
                  body: JSON.stringify({
                    amount: ticketAmount,
                    type: ticketType,
                  }),
                },
              );
              refetchTeam();
              setIsBuyingTickets(false);
              setTicketAmount(1);
              setTicketType("bus");
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
            }}
            disabled={ticketAmount * prices[ticketType] > team.balance}
          >
            <Text
              style={{
                fontFamily: "Inter_700Bold",
                color:
                  ticketAmount * prices[ticketType] <= team.balance
                    ? "#ffffff"
                    : "#888888",
                fontSize: 24,
                letterSpacing: -1,
                textAlign: "center",
              }}
            >
              Purchase (${ticketAmount * prices[ticketType]})
            </Text>
          </Pressable>
        </Pressable>
      ) : (
        <>
          <TeamSectionHeader>TASKS</TeamSectionHeader>
          <TeamQuestContainer>
            {questsQuery.isLoading && <Text>Loading...</Text>}
            {questsQuery.isError && <Text>Error...</Text>}
            {questsQuery.data && (
              <FlatList
                data={questsQuery.data.filter((q) => !q.complete)}
                overScrollMode="never"
                scrollEnabled={false}
                style={{ padding: 10 }}
                contentContainerStyle={{ gap: 10 }}
                renderItem={({ item }) => (
                  <QuestItem
                    quest={item}
                    isAbleToComplete={team.is_runner}
                    completeFn={async () => {
                      await completeQuestMutation.mutateAsync(item.id);
                      questsQuery.refetch();
                      refetchTeam();
                    }}
                    vetoFn={async () => {
                      await vetoQuestMutation.mutateAsync(item.id);
                      questsQuery.refetch();
                      refetchTeam();
                    }}
                  />
                )}
              />
            )}

            {questsQuery.data &&
              !isVetoPeriodActive(team.veto_period_end) &&
              team.is_runner &&
              questsQuery.data.filter(
                (q) => !q.complete && q.quest_type === "side",
              ).length === 0 && (
                <SideQuestGenerationButton
                  onPress={async () => {
                    await sideQuestMutation.mutateAsync();
                    await questsQuery.refetch();
                  }}
                >
                  <TeamSubheader>+ Generate side quest</TeamSubheader>
                </SideQuestGenerationButton>
              )}
          </TeamQuestContainer>
          <TeamSectionHeader style={{ paddingTop: 50 }}>
            POWERUPS
          </TeamSectionHeader>
          <PowerupsContainer>
            {team.is_runner ? (
              <>
                <PowerupContainer onPress={() => buyPowerup("reveal_hunters")}>
                  <PowerupImage
                    source={require("../../../assets/powerups/powerup_reveal.png")}
                  />
                  <PowerupTitle>Reveal</PowerupTitle>
                  <PowerupPrice>$400</PowerupPrice>
                </PowerupContainer>
                <PowerupContainer onPress={() => buyPowerup("freeze_hunters")}>
                  <PowerupImage
                    source={require("../../../assets/powerups/powerup_freeze.png")}
                  />
                  <PowerupTitle>Freeze</PowerupTitle>
                  <PowerupPrice>$1000</PowerupPrice>
                </PowerupContainer>
                <PowerupContainer onPress={() => buyPowerup("hide_tracker")}>
                  <PowerupImage
                    source={require("../../../assets/powerups/powerup_hide.png")}
                  />
                  <PowerupTitle>Hide</PowerupTitle>
                  <PowerupPrice>$600</PowerupPrice>
                </PowerupContainer>
              </>
            ) : (
              <>
                <PowerupContainer onPress={() => buyPowerup("hunt")}>
                  <PowerupImage
                    source={require("../../../assets/powerups/powerup_hunt.png")}
                  />
                  <PowerupTitle>Hunt</PowerupTitle>
                  <PowerupPrice>$200</PowerupPrice>
                </PowerupContainer>
                <PowerupContainer onPress={() => buyPowerup("freeze_runners")}>
                  <PowerupImage
                    source={require("../../../assets/powerups/powerup_freeze.png")}
                  />
                  <PowerupTitle>Freeze</PowerupTitle>
                  <PowerupPrice>$1000</PowerupPrice>
                </PowerupContainer>
                <PowerupContainer onPress={() => buyPowerup("blacklist")}>
                  <PowerupImage
                    source={require("../../../assets/powerups/powerup_hide.png")}
                  />
                  <PowerupTitle>Blacklist</PowerupTitle>
                  <PowerupPrice>$600</PowerupPrice>
                </PowerupContainer>
              </>
            )}
          </PowerupsContainer>
          {!team.is_runner && (
            <CatchButton
              onPress={() => {
                fetchTypeSafe<null>(ENDPOINTS.teams.catch(team.id), authCtx, {
                  method: "POST",
                });
              }}
            >
              <CatchButtonText>Catch runners</CatchButtonText>
            </CatchButton>
          )}
        </>
      )}
    </TeamDetailContainer>
  );
};

let globalAuthCtx: AuthContextType | null = null;
let gameId = "";

TaskManager.defineTask(
  LOCATION_TASK_NAME,
  async ({
    data: { locations },
    error,
  }: {
    data: { locations: Location.LocationObject[] };
    error: unknown;
  }) => {
    if (error) return;
    if (!globalAuthCtx) return;
    if (gameId === "") return;

    if (locations) {
      await fetchTypeSafe<null>(ENDPOINTS.locations.publish, globalAuthCtx, {
        method: "POST",
        body: JSON.stringify({
          location: {
            lat: locations[0].coords.latitude,
            lng: locations[0].coords.longitude,
            alt: locations[0].coords.altitude,
            precision: locations[0].coords.accuracy,
            heading: locations[0].coords.heading,
            speed: locations[0].coords.speed,
          },
          game_id: gameId,
        }),
      });
    }
  },
);

const TeamDetailScreen: React.FC = () => {
  const authContext = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamQuery = useQuery({
    queryKey: ["team", id],
    queryFn: async () =>
      fetchTypeSafe<Team>(ENDPOINTS.teams.id(id), authContext),
  });
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    (async () => {
      if (!teamQuery.data) return;
      console.log(ENDPOINTS.games.powerups(teamQuery.data.game_id));

      const powerupData = await fetchTypeSafe<Powerup[]>(
        ENDPOINTS.games.powerups(teamQuery.data.game_id),
        authContext,
      );

      setActivePowerups(powerupData ? powerupData : []);
    })();
  }, [teamQuery.data]);

  const [visiblePlayers, setVisiblePlayers] = useState([] as LocationPayload[]);
  const [selectedPlayerId, setSelectedPlayerId] = useState("0");

  const memoVisiblePlayers = useMemo(() => visiblePlayers, [visiblePlayers]);

  const updateMarker = useCallback((data: LocationPayload) => {
    setVisiblePlayers((prevPlayers) => {
      const newValue = [] as LocationPayload[];
      let inserted = false;

      // Replaces the one or creates a new
      prevPlayers.forEach((player) => {
        if (player.loc.user_id === data.loc.user_id) {
          newValue.push(data);
          inserted = true;
        } else {
          newValue.push(player);
        }
      });
      if (!inserted) {
        newValue.push(data);
      }
      return newValue;
    });
  }, []);

  function onPlayerMarkerPress(playerId: string) {
    // If this player is selected set selected to none
    setSelectedPlayerId(selectedPlayerId === playerId ? "0" : playerId);
  }

  const [activePowerups, setActivePowerups] = useState([] as Powerup[]);

  const ws = useRef(new WebSocket(ENDPOINTS.ws));
  // Whether the connection has been established and
  // auth has been successful
  const [established, setEstablished] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  async function handleIncomingMsg(msg: WsMessage) {
    switch (msg.typ) {
      case "loc":
        // handle location update
        // logs location for now (UPDATE THIS!!!!!!)
        console.log(msg.dat);
        updateMarker(msg.dat);

        break;
      case "pwp":
        // add some additional shit idk
        setActivePowerups([...activePowerups, msg.dat.pwp]);
        break;
      case "cat":
        // handle catching
        setVisiblePlayers([]);
        await teamQuery.refetch();
        break;
      default:
        console.error(`unhandled message type! ${msg}`);
    }
  }

  useEffect(() => {
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data);
      if (data === "ok") {
        setEstablished(true);
        console.log(`connection established with ws server at ${ENDPOINTS.ws}`);
        return;
      }

      // this is likely a "correct" message, so we can hand it off to the handler
      handleIncomingMsg(data);
    };

    (async () => {
      const location = await Location.getLastKnownPositionAsync();

      mapRef.current.animateToRegion({
        ...location.coords,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    })();
  }, []);

  useEffect(() => {
    if (!teamQuery.data?.game_id) return;
    if (!authContext.accessToken) return;
    if (established) return;

    ws.current.onopen = () => {
      ws.current.send(
        JSON.stringify({
          name: "join",
          data: {
            t: authContext.accessToken,
            g: teamQuery.data?.game_id,
          },
        }),
      );

      console.log(
        JSON.stringify({
          name: "join",
          data: {
            t: authContext.accessToken,
            g: teamQuery.data?.game_id,
          },
        }),
      );
    };

    if (!hasStarted) {
      globalAuthCtx = authContext;
      gameId = teamQuery.data?.game_id;

      Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
        showsBackgroundLocationIndicator: true,
        deferredUpdatesDistance: 50,
        deferredUpdatesInterval: 15_000,
        foregroundService: {
          killServiceOnDestroy: true,
          notificationTitle: "Broadcasting location",
          notificationBody:
            "Your location is being broadcasted to other players!",
        },
        accuracy: Location.Accuracy.BestForNavigation,
      });

      setHasStarted(true);
    }
  }, [teamQuery.data?.game_id]);

  return (
    <FullScreenView>
      <MapView
        style={{ flex: 1 }}
        showsCompass={false}
        showsUserLocation={true}
        showsMyLocationButton={false}
        userLocationCalloutEnabled={true}
        customMapStyle={customMapTheme}
        onPress={() => {
          setSelectedPlayerId("0");
        }}
        moveOnMarkerPress={false}
        ref={mapRef}
      >
        {memoVisiblePlayers.map((payload) => {
          return (
            <PlayerMarker
              key={payload.loc.user_id}
              dat={payload}
              selected={selectedPlayerId === payload.loc.user_id}
              onPress={() => {
                onPlayerMarkerPress(payload.loc.user_id);
              }}
            />
          );
        })}
      </MapView>

      <PowerupIndicatorsContainer style={{}}>
        {activePowerups.map((powerup) => (
          <PowerupIndicator
            key={powerup.id}
            powerup={powerup}
            destroySelf={() => {
              setActivePowerups((value) => {
                return value.filter((p) => p.id !== powerup.id);
              });
            }}
          />
        ))}
      </PowerupIndicatorsContainer>
      <BottomSheet
        snapPoints={[110, "85%"]}
        handleIndicatorStyle={{ opacity: 0 }}
        backgroundStyle={{ backgroundColor: "#252525" }}
        enableOverDrag={true}
        onAnimate={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      >
        <BottomSheetScrollView>
          {teamQuery.isLoading && <ActivityIndicator />}
          {teamQuery.data && (
            <TeamDetailView
              team={teamQuery.data}
              refetchTeam={async () => {
                await teamQuery.refetch();
              }}
            />
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </FullScreenView>
  );
};

export default TeamDetailScreen;
