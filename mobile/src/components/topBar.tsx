import styled from "@emotion/native";
import { User } from "../types";
import * as Haptics from "expo-haptics";
import LoadingGlyph from "./loadingGlyph";

const Container = styled.View`
  margin-top: 63px;
  width: 100%;
  align-items: center;
  flex-direction: row;
`;

const InertiaLogo = styled.Image`
  width: 55px;
  height: 55px;
  left: 27px;
`;

const UserInfoContainer = styled.View`
  align-items: center;
  height: 100%;
  justify-content: center;
  position: absolute;
  right: 27px;
  overflow: hidden;
  border-radius: 10px;
`;

const UserInfoButton = styled.Pressable`
  align-items: center;
  justify-content: center;
  flex-direction: row;
  gap: 10px;
`;

const Username = styled.Text`
  font-size: 24px;
  color: #ffffff;
  font-family: Inter_600SemiBold;
  letter-spacing: -1.6px;
`;

const UserProfilePicutre = styled.Image`
  width: 39px;
  height: 39px;
  border-radius: 26px;
`;

const PressableContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
`;

type TopBarProps = {
  userData: User | "loading";
  onclicks: {
    profilePicture: () => void;
    inertiaIcon: () => void;
  };
};

const TopBar: React.FC<TopBarProps> = ({ userData, onclicks }) => {
  return (
    <Container>
      <PressableContainer
        onPress={() => {
          onclicks.inertiaIcon();
        }}
      >
        <InertiaLogo source={require("./../../assets/inertia-icon.png")} />
      </PressableContainer>
      <UserInfoContainer>
        {userData == "loading" ? (
          <LoadingGlyph width={170} height={50}></LoadingGlyph>
        ) : (
          <UserInfoButton
            onPress={() => {
              //   bottomSheetRef.current.expand();
              //   userDataRequest.refetch();
              //   setIsBottomSheetVisible(true);
              //   Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onclicks.profilePicture();
            }}
          >
            <Username>{userData.display_name}</Username>
            <UserProfilePicutre
              source={{
                uri: `https://cdn.discordapp.com/avatars/${userData.discord_id}/${userData.image}.png?size=39px`,
              }}
            />
          </UserInfoButton>
        )}
      </UserInfoContainer>
    </Container>
  );
};

export default TopBar;
