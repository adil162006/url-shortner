import prisma from "../config/db";
import { createShort } from "../lib/url";
export const getUrls = async(userId:string)=>{
    const urls = await prisma.url.findMany({
        where:{
            userId
        },
        select:{
            title:true,
            orignalUrl:true,
            shortCode:true
        }
    })
    return urls
}


export const generateShortUrl = async (userId:string,title:string,orignalUrl:string) => {
    let shortCode = createShort()
  while (await prisma.url.findUnique({ where: { shortCode } })) {
    shortCode = createShort();
  }
   return prisma.url.create({
    data: {
      title,
      orignalUrl,
      shortCode,
      userId,
    },
  });
}

export const getOrignalUrl = async(shortCode:string)=>{
    const data  = await prisma.url.findUnique({
        where:{
            shortCode
        },
        select:{
            orignalUrl:true
        }
    })
    return data
}
