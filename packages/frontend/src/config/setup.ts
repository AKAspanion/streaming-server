// import { getNetworkAPIUrl } from './api';

// let interval: NodeJS.Timer;
// let loading = false;
// let loaded = false;
export const setup = (callback: () => void) => {
  try {
    // if (loaded) {
    //   clearInterval(interval);
    //   callback();
    //   return;
    // }
    // interval = setInterval(async () => {
    //   if (!loading && !loaded) {
    //     try {
    //       loading = true;
    //       const res = await fetch(`${getNetworkAPIUrl()}/server/ready`);
    //       if (res.status === 200 || res.status === 304) {
    //         const data = await res.json();
    //         loaded = true;
    //         if (data?.ip) window.networkHost = `http://${data?.ip}`;
    //         clearInterval(interval);
    //         callback();
    //       } else {
    //         loading = false;
    //       }
    //     } catch {
    //       loading = false;
    //     }
    //   }
    // }, 500);
    callback();
  } catch (error) {
    callback();
  }
};
