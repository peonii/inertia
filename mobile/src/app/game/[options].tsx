import styled from "@emotion/native";
import { Game } from "../../types";

const CenteredView = styled.View`
  background-color: #252525;
`;
const MediumTitle = styled.Text`
  font-size: 32px;
  color: #ffffff;
`;

type GameOptionsProps = {
  game?: Game;
};

const GameOptions: React.FC<GameOptionsProps> = ({ game }) => {
  return (
    <CenteredView>
      <MediumTitle>{game.name}</MediumTitle>
      <MediumTitle>{game.official}</MediumTitle>
    </CenteredView>
  );
};

export default GameOptions;
