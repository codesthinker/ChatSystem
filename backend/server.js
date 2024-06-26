import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import connectToMongoDB from "./config/db.js";
import UserRoutes from "./routes/UserRoutes.js";
import ChatRoutes from "./routes/ChatRoutes.js";
import MessageRoutes from "./routes/MessageRoutes.js";
import path from "path";
import { fileURLToPath } from 'url'; // Import fileURLToPath
import { dirname, join } from 'path';
import {
  notFoundHandler,
  appErrorHandler,
} from "./middleware/ErrorMiddleware.js";
import configureSocketEvents from "./config/sockets.js";

connectToMongoDB();

const app = express();
const __filename = fileURLToPath(import.meta.url); // Get the filename
const __dirname = dirname(__filename); // Get the directory name
const PORT = process.env.PORT || 5000;

// Config middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// App routes
app.use("/api/user", UserRoutes);
app.use("/api/chat", ChatRoutes);
app.use("/api/message", MessageRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'messageFiles')));

// ====================  Deployment ========================= //
if (process.env.NODE_ENV === "production") {
  // Establishes the path to our frontend (most important)
  app.use(express.static(path.join(__dirname, "/frontend/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.join(__dirname, "/frontend/build/index.html"))
  );
}
// ====================  Deployment ========================= //

// Error middlewares
app.all("*", notFoundHandler);
app.use(appErrorHandler);

const server = app.listen(PORT, () =>
  console.log(`📍 Server started at port ${PORT}`)
);

// Server socket configuration
configureSocketEvents(server);
app.use('/uploads', express.static(path.join(__dirname, 'messageFiles')));
