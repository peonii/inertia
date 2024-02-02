import styled from "@emotion/native";

const LeftAlignedView = styled.View`
  align-items: flex-start;
  flex-direction: column;
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

const ProfileSection = styled.View``;

const ProfileTextSection = styled.View``;

const BigProfilePicture = styled.Image``;

const RoleText = styled.Text``;

const StatsText = styled.Text``;

const HomeDetails: React.FC = () => {
  return (
    <LeftAlignedView>
      <ProfileSection>
        <BigProfilePicture source={require("./../../assets/nattie-pfp.png")} />
      </ProfileSection>
    </LeftAlignedView>
  );
};

export default HomeDetails;
