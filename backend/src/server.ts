import express from "express"


const app = express()

import cors from "cors";
import cookieParser from "cookie-parser";
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.get("/health",(req,res)=>{
    res.send("api running ")
})



export default app;
