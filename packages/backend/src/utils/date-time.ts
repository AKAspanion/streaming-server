export const secToTime = (timeTnSeconds: number) => {
  const duration = timeTnSeconds * 1000;

  return msToTime(duration);
};

export const msToTime = (timeTnMs: number) => {
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

  return h + ':' + m + ':' + s + '.' + ms;
};
