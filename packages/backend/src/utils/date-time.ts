export const secToTime = (timeTnSeconds: number, onlyValid = false) => {
  const duration = timeTnSeconds * 1000;

  return msToTime(duration, onlyValid);
};

export const msToTime = (timeTnMs: number, onlyValid = false) => {
  const milliseconds = Math.floor(timeTnMs % 1000);
  const seconds = Math.floor((timeTnMs / 1000) % 60);
  const minutes = Math.floor((timeTnMs / (1000 * 60)) % 60);
  const hours = Math.floor((timeTnMs / (1000 * 60 * 60)) % 24);

  const h = hours < 10 ? '0' + hours : hours;
  const m = minutes < 10 ? '0' + minutes : minutes;
  const s = seconds < 10 ? '0' + seconds : seconds;
  const ms =
    milliseconds < 10
      ? '00' + milliseconds
      : milliseconds < 100
      ? '0' + milliseconds
      : milliseconds;

  if (onlyValid) {
    const v = m + ':' + s;
    return hours ? h + ':' + v : v;
  } else {
    return h + ':' + m + ':' + s + '.' + ms;
  }
};

export const timestampToSeconds = (timestamp: string) => {
  const time = timestamp.split(':');
  const seconds = parseInt(time[0]) * 60 * 60 + parseInt(time[1]) * 60 + parseInt(time[2]);
  return seconds;
};
