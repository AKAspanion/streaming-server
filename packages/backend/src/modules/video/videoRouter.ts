import { Router } from "express";
import {
  addVideo,
  getAllVideo,
  getVideo,
  streamVideo,
} from "./videoController";
import { upload } from "@config/multer";

const router = Router();

router.get("/", getAllVideo);
router.get("/:id", getVideo);
router.get("/stream/:id", streamVideo);
router.post("/", upload.single("video_file"), addVideo);

export default router;
