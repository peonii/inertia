import styled from "@emotion/native";
import * as Linking from "expo-linking";

const LeftAlignedView = styled.View`
  padding: 14px 38px;
  align-items: flex-start;
  flex-direction: column;
  height: 100%;
`;

const BigTitle = styled.Text`
  font-size: 40px;
  color: #ffffff;
  font-family: Inter_700Bold;
  letter-spacing: -1.9px;
`;

const MediumTitle = styled.Text`
  font-size: 32px;
  color: #ffffff;
  font-family: Inter_700Bold;
  letter-spacing: -1.6px;
`;

const ProfileSection = styled.View`
  flex-direction: row;
  gap: 20px;
  justify-content: center;
  align-items: center;
  margin-bottom: 70px;
`;

const ProfileTextSection = styled.View`
  justify-content: center;
`;

const BigProfilePicture = styled.Image`
  width: 80px;
  height: 80px;
  border-radius: 40px;
`;

const RoleText = styled.Text`
  font-size: 24px;
  color: #7c7c7c;
  font-family: Inter_500Medium;
  margin-top: -10px;
  letter-spacing: -1.2px;
`;

const StatsText = styled.Text`
  font-size: 20px;
  color: #a5a5a5;
  font-family: Inter_600SemiBold;
  include-font-padding: false;
  letter-spacing: -1px;
`;

const LogoutButtonContainer = styled.Pressable`
  align-items: center;
  justify-content: center;
  position: absolute;
  bottom: 50px;
  left: 38px;
`;

const LogoutButtonView = styled.View`
  align-items: center;
  justify-content: center;
  background-color: #3d3d3d;
  width: 124px;
  height: 61px;
  border-radius: 10px;
`;

const LogoutButtonText = styled.Text`
  font-size: 24px;
  color: #ffffff;
  font-family: Inter_500Medium;
  letter-spacing: -1.2px;
`;
type HomeDetailsProps = {
  userData: {
    username: string;
    profile_picture: unknown;
    role: string;
    statistics: {
      rank: number;
      wins: number;
      draws: number;
      losses: number;
      xp_gained: number;
    };
  };
  logoutFunction: () => void;
};

const HomeDetails: React.FC<HomeDetailsProps> = ({
  userData,
  logoutFunction,
}) => {
  return (
    <LeftAlignedView>
      <ProfileSection>
        <BigProfilePicture source={userData.profile_picture} />
        <ProfileTextSection>
          <BigTitle>{userData.username}</BigTitle>
          <RoleText>{userData.role}</RoleText>
        </ProfileTextSection>
      </ProfileSection>

      <MediumTitle>Stats</MediumTitle>
      <BigTitle>{`#${userData.statistics.rank} Global`}</BigTitle>
      <StatsText>
        {`${userData.statistics.wins} wins, ${userData.statistics.draws} draws, ${userData.statistics.losses} losses`}
      </StatsText>
      <StatsText>{`${userData.statistics.xp_gained} XP gained`}</StatsText>

      <LogoutButtonContainer onPress={() => logoutFunction()}>
        <LogoutButtonView>
          <LogoutButtonText>Log out</LogoutButtonText>
        </LogoutButtonView>
      </LogoutButtonContainer>
    </LeftAlignedView>
  );
};

export default HomeDetails;
