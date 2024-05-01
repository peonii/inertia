import styled from "@emotion/native";
import { ActiveQuest } from "../../types";
import { Alert } from "react-native";

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
  position: relative;
`;

const TeamQuestIcon = styled.Image`
  width: 48px;
  height: 48px;
`;

const QuestButtonContainer = styled.View`
  position: absolute;
  right: -15%;
  flex: 2;
  flex-direction: row;
  gap: 10px;
`;

const CompleteQuestButton = styled.Pressable`
  background-color: #4a4a4a;
  border-radius: 10px;
  padding: 10px;
`;

const CompleteQuestButtonText = styled.Text`
  font-size: 17px;
  font-family: Inter_700Bold;
  letter-spacing: -1.2px;
  color: #ffffff;
`;

const VetoQuestButtonText = styled.Text`
  font-size: 17px;
  font-family: Inter_400Regular;
  letter-spacing: -1.2px;
  color: #ff3333;
`;

const TeamQuestCenteredView = styled.View`
  justify-content: center;
`;

export const QuestItem: React.FC<{
  quest: ActiveQuest;
  completeFn: () => Promise<void>;
}> = ({ quest, completeFn }) => {
  function showCompletionDialogAlert() {
    Alert.alert(
      "Complete Quest",
      `Are you sure you want to complete the quest: ${quest.title}?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Complete",
          onPress: async () => {
            await completeFn();
          },
        },
      ],
    );
  }

  return (
    <TeamQuestItemContainer>
      <TeamQuestIcon source={require("./../../../assets/main_task.png")} />
      <TeamQuestCenteredView>
        <TeamQuestHeader>{quest.title}</TeamQuestHeader>
        <TeamSubheader numberOfLines={1}>
          {quest.money > 0 ? `$${quest.money}` : `${quest.xp} XP`}
        </TeamSubheader>
        <QuestDescription>{quest.description}</QuestDescription>
      </TeamQuestCenteredView>
      <QuestButtonContainer>
        {quest.quest_type == "side" && (
          <CompleteQuestButton>
            <VetoQuestButtonText>Veto</VetoQuestButtonText>
          </CompleteQuestButton>
        )}
        <CompleteQuestButton onPress={showCompletionDialogAlert}>
          <CompleteQuestButtonText>Complete</CompleteQuestButtonText>
        </CompleteQuestButton>
      </QuestButtonContainer>
    </TeamQuestItemContainer>
  );
};
