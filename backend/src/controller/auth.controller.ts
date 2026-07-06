import type {Request, Response} from "express";
import { registerUser,loginUser } from "../service/auth.service";
import { AsyncHandler } from "../utils/AsyncHandler";
import prisma from "../config/db";
import { refreshUserToken } from "../service/auth.service";
import { AppError } from "../utils/AppError";

export const register = AsyncHandler(async(req:Request,res:Response)=>{
    const {name,email,password} = req.body;

if(!name || !email || !password){
    return res.status(400).json({
        message:"all fields are required"
    })
}

    const { user, accessToken, refreshToken } = await registerUser(req.body);
    res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false, // true in production with HTTPS
    sameSite: "lax",
    maxAge: 15 * 60 * 1000, // 15 minutes
  });
    res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
 return res.status(201).json({
    success: true,
    message: "User registered successfully",
    user,
  });

})

export const login = AsyncHandler(async(req:Request,res:Response)=>{
    const {email,password} = req.body
if(!email || !password){
    return res.status(400).json({
        message:"All fields are required"
    })
}

const { user, accessToken, refreshToken } = await loginUser(req.body);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Login successful",
    user,
  });
})

export const logout = async (req: Request, res: Response) => {
  await prisma.user.update({
    where: {
      id: req.user!.userId,
    },
    data: {
      hashedRefreshToken: null,
    },
  });

  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

export const me = AsyncHandler(async(req:Request,res:Response)=>{
  const userId=req.user?.userId
  if(!userId) throw new AppError("Not logged in",401);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true }, // never leak password/hashedRefreshToken
  });
 
  if (!user) {
    throw new AppError("User not found", 404);
  }
 
  return res.status(200).json({
    success: true,
    user,
  });
})

export const refresh = AsyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  const { accessToken, refreshToken: newRefreshToken } =
    await refreshUserToken(refreshToken);

  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", newRefreshToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
  });
});