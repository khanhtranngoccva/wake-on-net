export function getColorFromOnlineStatus(online?: boolean) {
  let color: string;
  if (online === undefined) {
    color = "#ffae00";
  } else {
    color = online ? "#009b00" : "#ff0000";
  }
  return color;
}