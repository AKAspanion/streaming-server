# [Video Streaming Server](https://akaspanion.github.io/streaming-server/)

This app let's you manage your video files and stream it over your local network.  
Built using React + NodeJS + FFMPEG + Electron.

![page](https://akaspanion.github.io/streaming-server/_app/immutable/assets/dashboard-dark.d2619712.png)

## [Download](https://github.com/AKAspanion/streaming-server/releases/latest)

You can download the latest release of the application [here](https://github.com/AKAspanion/streaming-server/releases/latest).

## Locally

### Clone the repo

Create `.env.development` in both **frontend** and **backend** packages.  
Copy over the contents of `.env.sample` file respectively.

> You can adjust the env values as per your liking

### Run the app

```bash
yarn
yarn dev
```

Video Streaming Server will launch at http://localhost:5709/

### Electron shell

> Make sure the dev command is up and running before this!

To start the electron shell.

```bash
yarn dev:electron
```

## Author

Ankit Kumar Pandit
