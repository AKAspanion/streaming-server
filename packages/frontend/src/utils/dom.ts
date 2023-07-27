export const copyTextToClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);

    return true;
  } catch (error) {
    return false;
  }
};
