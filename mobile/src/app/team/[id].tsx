import styled from "@emotion/native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import MapView, { Callout, MapMarker, Marker } from "react-native-maps";
import { fetchTypeSafe } from "../../api/fetch";
import { ActiveQuest, Players, Team, WsMessage } from "../../types";
import { ENDPOINTS } from "../../api/constants";
import { useAuth } from "../../context/AuthContext";
import { ActivityIndicator, Button, View } from "react-native";
import * as Haptics from "expo-haptics";
import { FlatList, Image, Text } from "react-native";
import { useEffect, useRef, useState } from "react";
import customMapTheme from "../../context/customMap";
import { QuestItem } from "../../components/teamDetail/quest";

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

const mockData: {
  quests: ActiveQuest[];
  locations: Players[];
} = {
  quests: [
    {
      id: "1",
      quest_id: "1",
      title: "Kasacja",
      description: "Wykasuj Sploya. Musisz to zrobić w co najmniej minutę.",
      xp: 100,
      money: 0,
      quest_type: "main",
      group_id: "1",
      lat: 37.78825,
      lng: -122.4324,
      complete: false,
      game_id: "1",
      team_id: "1",
      created_at: "2021-08-01T12:00:00Z",
      started_at: "2021-08-02T13:22:21Z",
    },
    {
      id: "2",
      quest_id: "2",
      title: "Kasacja 2",
      description:
        "Wykasuj Sploya. Musisz to zrobić w co najmniej minutę. Długi tekst długi tekst długi tekst długi tekst długi tekst długi tekst.",
      xp: 300,
      money: 0,
      quest_type: "main",
      group_id: "1",
      lat: 37.78825,
      lng: -122.4324,
      complete: false,
      game_id: "1",
      team_id: "1",
      created_at: "2021-08-01T12:00:00Z",
      started_at: "2021-08-02T13:22:21Z",
    },
    {
      id: "3",
      quest_id: "3",
      title: "Kasacja 3",
      description: "Wykasuj Sploya. Musisz to zrobić w co najmniej minutę.",
      xp: 300,
      money: 0,
      quest_type: "side",
      group_id: "1",
      lat: 37.78825,
      lng: -122.4324,
      complete: false,
      game_id: "1",
      team_id: "1",
      created_at: "2021-08-01T12:00:00Z",
      started_at: "2021-08-02T13:22:21Z",
    },
  ],
  locations: [
    {
      name: "Saon",
      lat: 52.139509,
      lng: 20.802601,
      alt: 0,
      precision: 2,
      heading: 2,
      speed: 1,
      user_id: "1778678293780758528",
      team_name: "Wielorybnia",
      experience: 500,
      rank: 1,
    },
  ],
};

const TeamDetailView: React.FC<{ team: Team }> = ({ team }) => {
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
      );
    },
  });

  const completeQuestMutation = useMutation({
    mutationFn: async (questId: string) => {
      await fetchTypeSafe<null>(ENDPOINTS.quests.complete(questId), authCtx);
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
                completeFn={async () => {
                  await completeQuestMutation.mutateAsync(item.id);
                  questsQuery.refetch();
                }}
              />
            )}
          />
        )}

        <Button
          onPress={async () => {
            await sideQuestMutation.mutateAsync();
          }}
          title="Generate side"
        />
      </TeamQuestContainer>
    </TeamDetailContainer>
  );
};

const Markers = mockData.locations.map((playerData) => {
  return (
    <Marker
      key={playerData.user_id}
      coordinate={{
        latitude: playerData.lat,
        longitude: playerData.lng,
      }}
      calloutAnchor={{ x: 1, y: 0.5 }}
    >
      <Callout>
        <View style={{ width: "100%", backgroundColor: "#212121" }}>
          <Text>{playerData.name}</Text>
        </View>
      </Callout>
    </Marker>
  );
});

const TeamDetailScreen: React.FC = () => {
  const authContext = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const teamQuery = useQuery({
    queryKey: ["team", id],
    queryFn: async () =>
      fetchTypeSafe<Team>(ENDPOINTS.teams.id(id), authContext),
  });

  const ws = useRef(new WebSocket(ENDPOINTS.ws));
  // Whether the connection has been established and
  // auth has been successful
  const [established, setEstablished] = useState(false);

  async function handleIncomingMsg(msg: WsMessage) {
    switch (msg.typ) {
      case "loc":
        // handle location update
        // logs location for now (UPDATE THIS!!!!!!)
        console.log(msg.dat);
        break;
      case "pwp":
        // handle powerup
        // todo actually write this api
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
  }, [teamQuery.data?.game_id]);

  return (
    <FullScreenView>
      <MapView
        style={{ flex: 1 }}
        initialRegion={{
          latitude: 37.78825,
          longitude: -122.4324,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        compassOffset={{ x: 1, y: 1 }}
        showsMyLocationButton={true}
        userLocationCalloutEnabled={true}
        customMapStyle={customMapTheme}
      >
        {Markers}
      </MapView>
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
        {teamQuery.data && <TeamDetailView team={teamQuery.data} />}
      </BottomSheet>
    </FullScreenView>
  );
};

export default TeamDetailScreen;
