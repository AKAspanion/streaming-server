import srtWebVtt from 'srt-webvtt';

type ToWebVTT = typeof srtWebVtt;

// srt-webvtt is CommonJS (`exports.default = toWebVTT`). Vite 8 uses Node-style interop for
// `"type": "module"` packages, so the default import is the whole exports object, not the function.
const toWebVTT: ToWebVTT =
  typeof srtWebVtt === 'function'
    ? srtWebVtt
    : (srtWebVtt as unknown as { default: ToWebVTT }).default;

export default toWebVTT;
