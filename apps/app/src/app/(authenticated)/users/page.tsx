import { database } from "@repo/database";
import { PageContainer } from "@/components/page-container";
import { UserList } from "./user-list";
import { CreateUserForm } from "./create-user-form";
import { CommentList } from "./comment-list";
import { CreateCommentForm } from "./create-comment-form";

export default async function UsersPage() {
  const users = await database.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  const comments = await database.comment.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageContainer title="Users">
      <div className="grid gap-6 p-4 lg:p-6">
        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Users</h2>
          <CreateUserForm />
          <UserList users={users} />
        </section>

        <section className="grid gap-4">
          <h2 className="text-lg font-semibold">Comments</h2>
          <CreateCommentForm users={users} />
          <CommentList comments={comments} />
        </section>
      </div>
    </PageContainer>
  );
}
