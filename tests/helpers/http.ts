import axios2 from "axios";

export const BACKEND_URL = `http://localhost:${process.env.PORT || 5000}`;

export const axios = {
  post: async (...args: any[]) => {
    try {
      const res = await (axios2.post as any)(...args);
      return { ...res, statusCode: res.status };
    } catch (e: any) {
      return { ...e.response, statusCode: e.response?.status };
    }
  },
  get: async (...args: any[]) => {
    try {
      const res = await (axios2.get as any)(...args);
      return { ...res, statusCode: res.status };
    } catch (e: any) {
      return { ...e.response, statusCode: e.response?.status };
    }
  },
  put: async (...args: any[]) => {
    try {
      const res = await (axios2.put as any)(...args);
      return { ...res, statusCode: res.status };
    } catch (e: any) {
      return { ...e.response, statusCode: e.response?.status };
    }
  },
  delete: async (...args: any[]) => {
    try {
      const res = await (axios2.delete as any)(...args);
      return { ...res, statusCode: res.status };
    } catch (e: any) {
      return { ...e.response, statusCode: e.response?.status };
    }
  },
};
