import { getUrls , generateShortUrl,getOrignalUrl} from "../service/url.service";
import { AsyncHandler } from "../utils/AsyncHandler";
import { AppError } from "../utils/AppError";
import type { Request,Response } from "express";


interface ShortCodeParams {
  shortCode: string;
}

export const getUserUrls = AsyncHandler( async (req:Request,res:Response)=>{
    const userId = req.user?.userId
    if (!userId) {
        throw new AppError("Not logged in ",400)
    }
    const urls = await getUrls(userId)

     res.status(200).json({
    success: true,
    data: urls,
  });
})


export const createShortCode = AsyncHandler(async(req:Request,res:Response)=>{
    const userId = req.user?.userId
    if (!userId) {
        throw new AppError("Not logged in ",400)
    }
    const {title,orignalUrl}= req.body;
    const data = await generateShortUrl(userId,title,orignalUrl)
 res.status(201).json({
    success: true,
    data: data,
  });
})

export const getOriginal = AsyncHandler(
  async (req: Request, res: Response) => {
    const shortCode = String(req.params.shortCode);

    const data = await getOrignalUrl(shortCode);

    if (!data) {
      throw new AppError("Short code not found", 404);
    }

    res.redirect(data.orignalUrl);
  }
);