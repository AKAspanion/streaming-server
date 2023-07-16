import { AppError, HttpCode } from "@utils/exceptions";
import multer from "multer";

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "_videos");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    console.log(file);
    cb(null, `video-${file.fieldname}-${Date.now()}.${ext}`);
  },
});

export const upload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    const allowed = ["mp4", "mkv"];
    if (allowed.includes(file.mimetype.split("/")[1])) {
      cb(null, true);
    } else {
      cb(
        new AppError({
          httpCode: HttpCode.BAD_REQUEST,
          description: "Not a Video File!!",
        })
      );
    }
  },
});
