"use client";

import type { User } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import { createComment } from "./actions";

interface CreateCommentFormProps {
  readonly users: readonly User[];
}

export function CreateCommentForm({ users }: CreateCommentFormProps) {
  return (
    <form action={createComment} className="flex items-end gap-3">
      <div className="grid gap-1.5">
        <label htmlFor="authorId" className="text-sm font-medium">
          Author
        </label>
        <select
          id="authorId"
          name="authorId"
          required
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
        >
          <option value="">Select a user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name ?? user.email}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="content" className="text-sm font-medium">
          Content
        </label>
        <input
          id="content"
          name="content"
          type="text"
          required
          placeholder="Write a comment..."
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
        />
      </div>
      <Button type="submit" size="sm">
        Add Comment
      </Button>
    </form>
  );
}
