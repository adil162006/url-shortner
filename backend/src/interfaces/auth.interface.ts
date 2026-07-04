export interface registerForm{
    email : string
    name : string
    password:string
}
export interface loginForm{
    email:string
    password:string
}
export type UserResponseType = {
  name: string;
  email: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
};
export type JwtPayloadType = {
  userId: string;
};