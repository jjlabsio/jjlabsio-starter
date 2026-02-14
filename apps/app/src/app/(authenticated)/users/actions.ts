"use server";

import { database } from "@repo/database";
import { revalidatePath } from "next/cache";

export async function createUser(formData: FormData) {
  const email = formData.get("email") as string;
  const name = formData.get("name") as string;

  await database.user.create({
    data: { email, name: name || null },
  });

  revalidatePath("/users");
}

export async function deleteUser(id: string) {
  await database.user.delete({ where: { id } });

  revalidatePath("/users");
}

export async function createComment(formData: FormData) {
  const content = formData.get("content") as string;
  const authorId = formData.get("authorId") as string;

  await database.comment.create({
    data: { content, authorId },
  });

  revalidatePath("/users");
}

export async function deleteComment(id: string) {
  await database.comment.delete({ where: { id } });

  revalidatePath("/users");
}
