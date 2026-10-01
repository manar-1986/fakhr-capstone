import { Router } from "express";
import { createPost, getPosts, getPost, interactPost, addComment, reportPost } from "./community.controller";
import { authenticate } from "../../middlewares/auth.middleware";
import { authorize } from "../../middlewares/authorize.middleware";
import { USER_ROLES } from "../../config/constants";
const router = Router();
// Guests see public posts only. Authenticated parents retain access to legacy member posts.
router.get("/posts", (req, res, next) => req.headers.authorization ? authenticate(req, res, next) : next(), getPosts);
router.get("/posts/:postId", (req, res, next) => req.headers.authorization ? authenticate(req, res, next) : next(), getPost);
router.use(authenticate, authorize(USER_ROLES.PARENT));
router.post("/posts", createPost);
router.put("/posts/:postId/:action", interactPost);
router.post("/posts/:postId/comments", addComment);
router.post("/posts/:postId/report", reportPost);
export default router;
