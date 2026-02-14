"use client";

import type { Comment, User } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import { deleteComment } from "./actions";

interface CommentWithAuthor extends Comment {
  readonly author: User;
}

interface CommentListProps {
  readonly comments: readonly CommentWithAuthor[];
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="text-muted-foreground text-sm">No comments yet.</p>;
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left font-medium">Author</th>
            <th className="px-4 py-2 text-left font-medium">Content</th>
            <th className="px-4 py-2 text-left font-medium">Created</th>
            <th className="px-4 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment.id} className="border-b last:border-0">
              <td className="px-4 py-2">
                {comment.author.name ?? comment.author.email}
              </td>
              <td className="px-4 py-2">{comment.content}</td>
              <td className="px-4 py-2">
                {comment.createdAt.toLocaleDateString("ko-KR")}
              </td>
              <td className="px-4 py-2 text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteComment(comment.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
