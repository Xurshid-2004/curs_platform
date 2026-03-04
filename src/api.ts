import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { db } from "./firebase";
import { ref, get, push, update } from "firebase/database";

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["User"],

  endpoints: (build) => ({

    // Barcha foydalanuvchilarni olish
    getUsers: build.query({
      async queryFn() {
        try {
          const snapshot = await get(ref(db, "users"));
          if (snapshot.exists()) {
            const data = snapshot.val();
            const users = Object.entries(data).map(([id, value]: any) => ({
              id,
              ...value,
            }));
            return { data: users };
          }
          return { data: [] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: (result: any) =>
        result
          ? [
              ...result.map(({ id }: any) => ({ type: "User" as const, id })),
              { type: "User" as const, id: "LIST" },
            ]
          : [{ type: "User" as const, id: "LIST" }],
    }),

    // Yangi foydalanuvchi qo'shish
    addUser: build.mutation({
      async queryFn(body) {
        try {
          const chars = "sdfghjjklzxcvbnbfghjkkjhghjm123456789876";
          const token = Array.from({ length: 10 }, () =>
            chars[Math.floor(Math.random() * chars.length)]
          ).join("");

          const newRef = await push(ref(db, "users"), { ...body, token });
          return { data: { id: newRef.key, ...body, token } };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),

    // Foydalanuvchini tahrirlash
    getEdit: build.mutation({
      async queryFn(data) {
        try {
          const { id, ...body } = data;
          await update(ref(db, `users/${id}`), body);
          return { data: { id, ...body } };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
  }),
});

export const { useGetUsersQuery, useAddUserMutation, useGetEditMutation } = userApi;