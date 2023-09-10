export const setup = (callback: () => void) => {
  try {
    callback();
  } catch (error) {
    callback();
  }
};
