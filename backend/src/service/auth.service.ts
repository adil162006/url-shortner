import type { registerForm, loginForm } from "../interfaces/auth.interface";
import prisma from "../config/db";
import { AppError } from "../utils/AppError";
import { hashPassword, comparePassword } from "../lib/hash";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/jwt";


export const registerUser = async(data:registerForm)=>{
const {email} = data

const existingUser = await prisma.user.findUnique({
    where:{
        email
    }
})
if (existingUser){
    throw new AppError("User Already exists",400);
}
const hashedPassword = await hashPassword(data.password);
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: hashedPassword,
    },
  });
const accessToken = signAccessToken({ userId: user.id });
const refreshToken = signRefreshToken({ userId: user.id });
const hashedRefreshToken = await hashPassword(refreshToken);

await prisma.user.update({
  where: {
    id: user.id,
  },
  data: {
    hashedRefreshToken,
  },
});

 return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };
}
export const loginUser = async(data:loginForm)=>{
  const {email,password}=data
  const user = await prisma.user.findUnique({
  where: {
    email,
  },
});

if (!user) {
  throw new AppError("User not found", 404);
}

const isCorrectPassword = await comparePassword(
  password,
  user.password
);
if(!isCorrectPassword)throw new AppError("Invalid Credentials",400)


  const accessToken = signAccessToken({
    userId: user.id,
  });

  const refreshToken = signRefreshToken({
    userId: user.id,
  });
const hashedRefreshToken = await hashPassword(refreshToken);
  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
       hashedRefreshToken 
    },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
  };

}
export const refreshUserToken = async (refreshToken: string) => {
  if (!refreshToken) {
    throw new AppError("Refresh token is required", 401);
  }

  let payload: { userId: string };

  try {
    payload = verifyRefreshToken(refreshToken) as { userId: string };
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }

  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!user || !user.hashedRefreshToken) {
    throw new AppError("Refresh token revoked", 401);
  }

  const isValid = await comparePassword(refreshToken, user.hashedRefreshToken);

  if (!isValid) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        hashedRefreshToken: null,
      },
    });

    throw new AppError("Refresh token revoked", 401);
  }

  const newAccessToken = signAccessToken({
    userId: user.id,
  });

  const newRefreshToken = signRefreshToken({
    userId: user.id,
  });

  const hashedRefreshToken = await hashPassword(newRefreshToken);

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      hashedRefreshToken,
    },
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};