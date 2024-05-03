import styled from "@emotion/native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import MapView, { Callout, MapMarker, Marker } from "react-native-maps";
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
  Button,
  PermissionsAndroid,
  Pressable,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { FlatList, Image, Text } from "react-native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import customMapTheme from "../../context/customMap";
import PlayerMarker from "../../components/playerMarker";
import { useDataContext } from "../../context/DataContext";
import { QuestItem } from "../../components/teamDetail/quest";
import { isVetoPeriodActive } from "../../utilis";
import * as TaskManager from "expo-task-manager";
import * as Location from "expo-location";
import PowerupIndicator from "../../components/teamDetail/powerupIndicator";

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

const QuestDescription = styled.Text`
  font-size: 17px;
  font-family: Inter_400Regular;
  letter-spacing: -1.2px;
  color: #ffffff;
  opacity: 0.7;
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

const PowerupContainer = styled.View`
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

const LOCATION_TASK_NAME = "inertia-location-task";

const TeamDetailView: React.FC<{
  team: Team;
  refetchTeam: () => Promise<void>;
}> = ({ team, refetchTeam }) => {
  const authCtx = useAuth();

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

  return (
    <TeamDetailContainer>
      <TeamHeaderContainer>
        <View>
          <TeamHeader>{team.name}</TeamHeader>
          <TeamSubheader>
            {team.is_runner ? "Runner" : "Hunter"}
            {"  "}•{"  "}
            {team.xp}XP
          </TeamSubheader>
        </View>
        <TeamBalance>${team.balance}</TeamBalance>
      </TeamHeaderContainer>
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
          questsQuery.data.filter((q) => !q.complete && q.quest_type === "side")
            .length === 0 && (
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
      <TeamSectionHeader style={{ paddingTop: 50 }}>POWERUPS</TeamSectionHeader>
      <PowerupsContainer>
        {team.is_runner ? (
          <>
            <PowerupContainer>
              <PowerupImage
                source={require("../../../assets/powerups/powerup_reveal.png")}
              />
              <PowerupTitle>Reveal</PowerupTitle>
              <PowerupPrice>$400</PowerupPrice>
            </PowerupContainer>
            <PowerupContainer>
              <PowerupImage
                source={require("../../../assets/powerups/powerup_freeze.png")}
              />
              <PowerupTitle>Freeze</PowerupTitle>
              <PowerupPrice>$1000</PowerupPrice>
            </PowerupContainer>
            <PowerupContainer>
              <PowerupImage
                source={require("../../../assets/powerups/powerup_hide.png")}
              />
              <PowerupTitle>Hide</PowerupTitle>
              <PowerupPrice>$600</PowerupPrice>
            </PowerupContainer>
          </>
        ) : (
          <>
            <PowerupContainer>
              <PowerupImage
                source={require("../../../assets/powerups/powerup_hunt.png")}
              />
              <PowerupTitle>Hunt</PowerupTitle>
              <PowerupPrice>$200</PowerupPrice>
            </PowerupContainer>
            <PowerupContainer>
              <PowerupImage
                source={require("../../../assets/powerups/powerup_freeze.png")}
              />
              <PowerupTitle>Freeze</PowerupTitle>
              <PowerupPrice>$1000</PowerupPrice>
            </PowerupContainer>
            <PowerupContainer>
              <PowerupImage
                source={require("../../../assets/powerups/powerup_hide.png")}
              />
              <PowerupTitle>Blacklist</PowerupTitle>
              <PowerupPrice>$600</PowerupPrice>
            </PowerupContainer>
          </>
        )}
      </PowerupsContainer>
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
    error: any;
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
  const dataContext = useDataContext();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamQuery = useQuery({
    queryKey: ["team", id],
    queryFn: async () =>
      fetchTypeSafe<Team>(ENDPOINTS.teams.id(id), authContext),
  });

  useEffect(() => {
    (async () => {
      if (!teamQuery.data) return;
      console.log(ENDPOINTS.games.powerups(teamQuery.data.game_id));

      const powerupData = await fetchTypeSafe<Powerup[]>(
        ENDPOINTS.games.powerups(teamQuery.data.game_id),
        authContext,
      );

      setActivePowerups(powerupData);
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
  const memoActivePowerups = useMemo(() => activePowerups, [activePowerups]);

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
        setActivePowerups((value) => {
          const newValue = [] as Powerup[];
          newValue.push(...value);
          newValue.push(msg.dat.pwp);
        });
        break;
      case "cat":
        // handle catching
        setVisiblePlayers([]);
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
        initialRegion={{
          latitude: 51.98825,
          longitude: 20.8324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsCompass={false}
        showsUserLocation={true}
        showsMyLocationButton={false}
        userLocationCalloutEnabled={true}
        customMapStyle={customMapTheme}
        onPress={() => {
          setSelectedPlayerId("0");
        }}
        moveOnMarkerPress={false}
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
        <PowerupIndicator
          powerup={{
            id: "123",
            type: "freeze_hunters",
            caster_id: "123",
            ends_at: "2024-05-02T23:18:00.212Z",
            created_at: "2024-05-02T23:16:00.212Z",
          }}
          destroySelf={() => {}}
        ></PowerupIndicator>
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
        {teamQuery.isLoading && <ActivityIndicator />}
        {teamQuery.data && (
          <TeamDetailView
            team={teamQuery.data}
            refetchTeam={async () => {
              await teamQuery.refetch();
            }}
          />
        )}
      </BottomSheet>
    </FullScreenView>
  );
};

export default TeamDetailScreen;
