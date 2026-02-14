"use client";

import { Button } from "@repo/ui/components/button";
import { createUser } from "./actions";

export function CreateUserForm() {
  return (
    <form action={createUser} className="flex items-end gap-3">
      <div className="grid gap-1.5">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="user@example.com"
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
        />
      </div>
      <div className="grid gap-1.5">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="John Doe"
          className="border-input bg-background h-9 rounded-md border px-3 text-sm"
        />
      </div>
      <Button type="submit" size="sm">
        Add User
      </Button>
    </form>
  );
}
