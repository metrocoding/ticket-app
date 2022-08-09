import { currentUser, requireAuth } from "@armineslami/ticketing-common";
import express from "express";

const router = express.Router();

router.get("/api/users/currentuser", currentUser, requireAuth, (req, res) => {
    res.send({ currentUser: req.currentUser || null });
});

export { router as currentUserRouter };
