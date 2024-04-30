import styled from "@emotion/native";
import BottomSheet from "@gorhom/bottom-sheet";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import MapView, { Callout, MapMarker, Marker } from "react-native-maps";
import { fetchTypeSafe } from "../../api/fetch";
import { ActiveQuest, Players, Team } from "../../types";
import { ENDPOINTS } from "../../api/constants";
import { useAuth } from "../../context/AuthContext";
import { ActivityIndicator, View } from "react-native";
import * as Haptics from "expo-haptics";
import { FlatList, Image, Text } from "react-native";
import { useRef, useState } from "react";
import customMapTheme from "../../context/customMap";

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

const TeamQuestHeader = styled.Text`
  font-size: 21px;
  font-family: Inter_700Bold;
  letter-spacing: -1.2px;
  color: #ffffff;
`;

const TeamQuestItemContainer = styled.View`
  flex-direction: row;
  gap: 10px;
  width: 85%;
`;

const TeamQuestIcon = styled.Image`
  width: 48px;
  height: 48px;
`;

const TeamQuestCenteredView = styled.View`
  justify-content: center;
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
        <FlatList
          data={mockData.quests}
          overScrollMode="never"
          scrollEnabled={false}
          style={{ padding: 10 }}
          contentContainerStyle={{ gap: 10 }}
          renderItem={({ item }) => (
            <TeamQuestItemContainer>
              <TeamQuestIcon source={require("./../../../assets/main_task.png")} />
              <TeamQuestCenteredView>
                <TeamQuestHeader>{item.title}</TeamQuestHeader>
                <TeamSubheader numberOfLines={1}>
                  {item.money > 0 ? `$${item.money}` : `${item.xp} XP`}
                </TeamSubheader>
                <QuestDescription>{item.description}</QuestDescription>
              </TeamQuestCenteredView>
            </TeamQuestItemContainer>
          )}
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
    queryFn: async () => fetchTypeSafe<Team>(ENDPOINTS.teams.id(id), authContext),
  });

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
        snapPoints={[110, "95%"]}
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
