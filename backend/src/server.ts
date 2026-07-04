import express from "express"

const app = express()

import cors from "cors";
import cookieParser from "cookie-parser";
app.use(express.json());
import routes from "./routes/index"
app.use(cors());
app.use(cookieParser());

app.get("/health",(req,res)=>{
    res.send("api running ")
})

// API Routes
app.use("/api/v1", routes);

export default app;
