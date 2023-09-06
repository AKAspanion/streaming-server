/* eslint-disable @typescript-eslint/ban-ts-comment */
export const copyTextToClipboard = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);

    return true;
  } catch (error) {
    return false;
  }
};

export const startTransitionOnClick = (ev: React.MouseEvent, callback: () => void) => {
  // @ts-ignore
  if (document.startViewTransition) {
    ev.preventDefault();

    // @ts-ignore
    return document.startViewTransition(callback);
  } else {
    callback();
  }
};

export const startTransition = (callback: () => void) => {
  // @ts-ignore
  if (document.startViewTransition) {
    // @ts-ignore
    return document.startViewTransition(callback);
  } else {
    callback();
  }
};
