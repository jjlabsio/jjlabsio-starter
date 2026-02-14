"use client";

import type { User } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import { deleteUser } from "./actions";

interface UserListProps {
  readonly users: readonly User[];
}

export function UserList({ users }: UserListProps) {
  if (users.length === 0) {
    return <p className="text-muted-foreground text-sm">No users yet.</p>;
  }

  return (
    <div className="rounded-md border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-2 text-left font-medium">Email</th>
            <th className="px-4 py-2 text-left font-medium">Name</th>
            <th className="px-4 py-2 text-left font-medium">Created</th>
            <th className="px-4 py-2 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b last:border-0">
              <td className="px-4 py-2">{user.email}</td>
              <td className="px-4 py-2">{user.name ?? "-"}</td>
              <td className="px-4 py-2">
                {user.createdAt.toLocaleDateString()}
              </td>
              <td className="px-4 py-2 text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteUser(user.id)}
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
