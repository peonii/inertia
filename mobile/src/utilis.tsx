import { View } from "react-native";

export function dimmColor(color: number) {
  return color - 20 < 0 ? 0 : color - 20;
}
export function brightenColor(color: number) {
  return color + 20 > 255 ? 255 : color + 20;
}

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function makeGradientColorsFromColor(color: string) {
  const red = parseInt(color.substring(1, 3), 16);
  const green = parseInt(color.substring(3, 5), 16);
  const blue = parseInt(color.substring(5, 7), 16);
  const startColor = `rgb(${dimmColor(red)}, ${dimmColor(green)}, ${dimmColor(blue)})`;
  const endColor = `rgb(${brightenColor(red)}, ${brightenColor(green)}, ${brightenColor(blue)})`;
  return [startColor, endColor];
}

export function formatDate(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  let day: string = date.getDate().toString();
  switch (day) {
    case "1":
      day += "st";
      break;
    case "2":
      day += "nd";
      break;
    case "3":
      day += "rd";
      break;
    default:
      day += "th";
      break;
  }
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hour: string | number =
    date.getHours() <= 12 ? date.getHours() : date.getHours() - 12;
  hour = hour.toString().length === 1 ? "0" + hour : hour;
  const idkHowToNameThis = date.getHours() < 12 ? "AM" : "PM";
  const minutes =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return `${day} ${month}, ${year}, ${hour}:${minutes} ${idkHowToNameThis}`;
}

export function formatDateShort(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  let day: string = date.getDate().toString();
  switch (day) {
    case "1":
      day += "st";
      break;
    case "2":
      day += "nd";
      break;
    case "3":
      day += "rd";
      break;
    default:
      day += "th";
      break;
  }
  const month = months[date.getMonth()].substring(0, 3);
  return `${day} ${month}`;
}

export function formatDateLong(dateString: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  let day: string = date.getDate().toString();
  switch (day) {
    case "1":
      day += "st";
      break;
    case "2":
      day += "nd";
      break;
    case "3":
      day += "rd";
      break;
    default:
      day += "th";
      break;
  }
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  let hour: string | number =
    date.getHours() <= 12 ? date.getHours() : date.getHours() - 12;
  hour = hour.toString().length === 1 ? "0" + hour : hour;
  const idkHowToNameThis = date.getHours() < 12 ? "AM" : "PM";
  const minutes =
    date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();
  return `${day} ${month.substring(0, 3)}, ${year}, ${hour}:${minutes} ${idkHowToNameThis}`;
}

export const VerticalSpacer: React.FC<{ height: number }> = ({ height }) => {
  return <View style={{ height: height }} />;
};

export function isVetoPeriodActive(vetoPeriod: string) {
  const vetoDate = new Date(vetoPeriod);
  const currentDate = new Date();
  // const differenceFromUTC = currentDate.getTimezoneOffset() / 60;
  // vetoDate.setHours(vetoDate.getHours() + differenceFromUTC);
  // console.log(vetoDate.toTimeString(), currentDate.toTimeString());
  return currentDate < vetoDate;
}
