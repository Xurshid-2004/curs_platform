import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { db,  } from "../firebase";
import { ref, get, push, update, remove } from "firebase/database";



export const teacherApi = createApi({
  reducerPath: "teacherApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Teacher"],

  endpoints: (build) => ({

    // Barcha o'qituvchilarni olish
    getTeachers: build.query({
      async queryFn() {
        try {
          const snapshot = await get(ref(db, "teacher"));
          if (snapshot.exists()) {
            const data = snapshot.val();
            const teachers = Object.entries(data).map(([id, value]: any) => ({
              id,
              ...value,
            }));
            return { data: teachers };
          }
          return { data: [] };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      providesTags: (result: any) =>
        result
          ? [
              ...result.map(({ id }: any) => ({ type: "Teacher" as const, id })),
              { type: "Teacher" as const, id: "LIST" },
            ]
          : [{ type: "Teacher" as const, id: "LIST" }],
    }),

    // Yangi o'qituvchi qo'shish (rasm File bo'lsa Storage ga yuklanadi)
  
addTeacher: build.mutation({
  async queryFn(body) {
    try {
      const newRef = await push(ref(db, "teacher"), {
        ...body,
        img: body.img, // link to'g'ridan-to'g'ri saqlanadi
      });
      return { data: { id: newRef.key, ...body } };
    } catch (error: any) {
      return { error: error.message };
    }
  },
  invalidatesTags: [{ type: "Teacher", id: "LIST" }],
}),





    // O'qituvchini tahrirlash
  editTeacher: build.mutation({
  async queryFn(data) {
    try {
      const { id, ...body } = data;
      await update(ref(db, `teacher/${id}`), { ...body });
      return { data: { id, ...body } };
    } catch (error: any) {
      return { error: error.message };
    }
  },
  invalidatesTags: [{ type: "Teacher", id: "LIST" }],
}),
    // O'qituvchini o'chirish
    deleteTeacher: build.mutation({
      async queryFn(id: string) {
        try {
          await remove(ref(db, `teacher/${id}`));
          return { data: id };
        } catch (error: any) {
          return { error: error.message };
        }
      },
      invalidatesTags: [{ type: "Teacher", id: "LIST" }],
    }),
  }),
});



export const {
  useGetTeachersQuery,
  useAddTeacherMutation,
  useEditTeacherMutation,
  useDeleteTeacherMutation,
} = teacherApi;