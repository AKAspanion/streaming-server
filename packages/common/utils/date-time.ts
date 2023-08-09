export const secToTime = (timeTnSeconds: number, onlyValid = false) => {
  const duration = timeTnSeconds * 1000;

  return msToTime(duration, onlyValid);
};

export const msToTime = (timeTnMs: number, onlyValid = false) => {
  const milliseconds = msToms(timeTnMs);
  const seconds = msToSec(timeTnMs);
  const minutes = msToMin(timeTnMs);
  const hours = msToHour(timeTnMs);

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

export const msToDay = (timeTnMs: number) => Math.floor(timeTnMs / (24 * 60 * 60 * 1000));

export const msToHour = (timeTnMs: number) => Math.floor((timeTnMs / (1000 * 60 * 60)) % 24);

export const msToMin = (timeTnMs: number) => Math.floor((timeTnMs / (1000 * 60)) % 60);

export const msToSec = (timeTnMs: number) => Math.floor((timeTnMs / 1000) % 60);

export const msToms = (timeTnMs: number) => Math.floor(timeTnMs % 1000);

export const timestampToSeconds = (timestamp: string) => {
  const time = timestamp.split(':');
  const seconds = parseInt(time[0]) * 60 * 60 + parseInt(time[1]) * 60 + parseInt(time[2]);
  return seconds;
};
