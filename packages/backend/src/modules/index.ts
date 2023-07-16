import { Router } from "express";
import videoRouter from "./video/videoRouter";

type RouteMap = Record<string, Router>;

export const routes: RouteMap = {
  "/video": videoRouter,
};
