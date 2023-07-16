import { vidoesDB } from "@database/json";
import { handleJSONDBDataError } from "@utils/error";
import { AppError, HttpCode } from "@utils/exceptions";
import { randomUUID } from "crypto";
import { RequestHandler } from "express";
import fs from "fs";
import path from "path";

export const addVideo: RequestHandler = async (req, res) => {
  const id = randomUUID();

  const body = { ...req.file };
  await vidoesDB.push(`/${id}`, body);
  const data = { id, ...body };

  return res.status(HttpCode.OK).send({ data });
};

export const deleteVideo: RequestHandler = async (req, res) => {
  const id = req.params.id || "";
  try {
    const data: VideoType = await vidoesDB.getData(`/${id}`);

    const fullPath = path.resolve(__dirname + "../../../../" + data.path);

    fs.unlink(fullPath, async (err) => {
      if (err) throw err; //handle your error the way you want to;
    });

    await vidoesDB.delete(`/${id}`);

    return res
      .status(HttpCode.OK)
      .send({ message: "Video deleted successfully" });
  } catch (error) {
    handleJSONDBDataError(error, id);
  }
};

export const streamVideo: RequestHandler = async (req, res) => {
  const id = req.params.id || "";
  try {
    // Ensure there is a range given for the video
    const range = req.headers.range;
    const result: VideoType = await vidoesDB.getData(`/${id}`);

    if (!range) {
      throw new AppError({
        httpCode: HttpCode.BAD_REQUEST,
        description: "Requires Range header",
      });
    }

    const videoSize = fs.statSync(result.path).size;

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(result.path, { start, end });

    // Stream the video chunk to the client
    videoStream.pipe(res);
  } catch (error) {
    handleJSONDBDataError(error, id);
  }
};

export const getAllVideo: RequestHandler = async (req, res) => {
  const data = await vidoesDB.getData("/");

  return res.status(HttpCode.OK).send({ data });
};

export const getVideo: RequestHandler = async (req, res) => {
  const id = req.params.id || "";
  try {
    const data = await vidoesDB.getData(`/${id}`);

    return res.status(HttpCode.OK).send({ data });
  } catch (error) {
    handleJSONDBDataError(error, id);
  }
};
