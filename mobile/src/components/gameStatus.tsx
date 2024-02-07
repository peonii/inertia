import styled from "@emotion/native";
import { useEffect, useRef, useState } from "react";

type GameStatusProps = {
  timeLine: {
    start: string | Date;
    end: string | Date;
  };
};

const StatusText = styled.Text`
  font-size: 16px;
  font-family: Inter_600SemiBold;
  letter-spacing: -1px;
`;

function miliSecondsToTime(miliSeconds: number) {
  let seconds = Math.floor(miliSeconds / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  seconds = seconds % 60;
  minutes = minutes % 60;
  hours = hours % 24;
  switch (days) {
    case 0:
      break;
    case 1:
      return `${days} day`;
    default:
      return `${days} days`;
  }
  switch (hours) {
    case 0:
      break;
    case 1:
      return `${hours} hour`;
    default:
      return `${hours} hours`;
  }
  switch (minutes) {
    case 0:
      break;
    case 1:
      return `${minutes} minute`;
    default:
      return `${minutes} minutes`;
  }
  return seconds > 1 ? `${seconds} seconds` : `${seconds} second`;
}

function twoDigits(value: number) {
  return value < 10 ? `0${value}` : value;
}
function calculateStatus(startTime: Date, endTime: Date, dateNow: Date) {
  if (endTime.getTime() < dateNow.getTime()) {
    return `Ended ${miliSecondsToTime(dateNow.getTime() - endTime.getTime())} ago`;
  }
  if (startTime.getTime() > dateNow.getTime()) {
    return `Starts in ${miliSecondsToTime(startTime.getTime() - dateNow.getTime())}`;
  }
  const milis = dateNow.getTime() - startTime.getTime();
  let seconds = Math.floor(milis / 1000);
  let minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  seconds = seconds % 60;
  minutes = minutes % 60;
  if (hours) return `Playing  •  ${hours}h${twoDigits(minutes)}m`;
  if (minutes) return `Playing  •  ${minutes}m${twoDigits(seconds)}s`;
  return `Playing  •  ${twoDigits(seconds)}s`;
}

const GameStatus: React.FC<GameStatusProps> = ({ timeLine }) => {
  const [dateNow, setDateNow] = useState(new Date());
  const currentInterval = useRef(null);

  useEffect(() => {
    clearInterval(currentInterval.current);
    currentInterval.current = setInterval(() => {
      setDateNow(new Date());
    }, 1000);
  }, [timeLine]);

  if (typeof timeLine.start === "string") timeLine.start = new Date(timeLine.start);
  if (typeof timeLine.end === "string") timeLine.end = new Date(timeLine.end);

  const status = calculateStatus(timeLine.start, timeLine.end, dateNow);
  const color = status.startsWith("Playing") ? "#439255" : "#7c7c7c";

  return <StatusText style={{ color: color }}>{status}</StatusText>;
};

export default GameStatus;
