import styled from "@emotion/native";
import { Marker } from "react-native-maps";

const Container = styled.View`
  width: 150px;
  height: 94px;
`;

const ImageContainer = styled.Pressable`
  width: 31px;
  height: 31px;
  border-radius: 22.5px;
`;

const PlayerMarker: React.FC = () => {
  return (
    <Marker coordinate={{ latitude: 0, longitude: 0 }}>
      <Container></Container>
    </Marker>
  );
};

export default PlayerMarker;
