import { networkInterfaces } from "os";

const interfaces = networkInterfaces();

export const getIPv4Address = () => {
  const allAddress = [{ type: "Local", address: "localhost" }];
  for (let interfaceKey in interfaces) {
    const addressList = interfaces[interfaceKey];
    addressList?.forEach((address) => {
      if (address.family === "IPv4" && !address.internal) {
        allAddress.push({ type: "Network", address: `${address.address}` });
      }
    });
  }

  return allAddress;
};

export const getIPv6Address = () => {
  const allAddress = [{ type: "Local", address: "localhost" }];
  for (let interfaceKey in interfaces) {
    const addressList = interfaces[interfaceKey];
    addressList?.forEach((address) => {
      if (address.family === "IPv6" && !address.internal) {
        allAddress.push({ type: "Network", address: `${address.address}` });
      }
    });
  }

  return allAddress;
};
