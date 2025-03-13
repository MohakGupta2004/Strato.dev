import express from "express";

declare module "express" {
  interface Request {
    user?: {
      _id: string,
      email: string;
    };
  }
}
