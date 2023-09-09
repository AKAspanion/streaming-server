#!/usr/bin/env sh

mkdir -p packages/backend/.bin/mac/ffmpeg
mkdir -p packages/backend/.bin/mac/ffprobe
mkdir -p packages/backend/.bin/win/ffmpeg
mkdir -p packages/backend/.bin/win/ffprobe

unzip -o ffmpeg/ffmpeg.zip -d packages/backend/.bin/mac/ffmpeg
unzip -o ffmpeg/ffprobe.zip -d packages/backend/.bin/mac/ffprobe
unzip -o ffmpeg/ffmpeg.exe.zip -d packages/backend/.bin/win/ffmpeg
unzip -o ffmpeg/ffprobe.exe.zip -d packages/backend/.bin/win/ffprobe
