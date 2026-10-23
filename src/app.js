import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
app.use(
  cors({ // is frontend ko api access krnay ki permission h
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);
console.log("CORS_ORIGIN:", process.env.CORS_ORIGIN);
// these all are express midlleware and execute b/w request and response
app.use(express.json({ limit: "16kb" })); // convert json data into js
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser()); // helps to read the raw data(means data in a long string turned to be in some values that helps the browswe to read whose data come)

import userRouter from "./routes/user.router.js";
import { errorHandler } from "./middlewares/error.middleware.js";

app.use("/api/v1/users", userRouter);
      console.log("is this fine");

app.get("/", (req, res) => {
  res.send("Server Working");
});

app.use(errorHandler)


export { app };
