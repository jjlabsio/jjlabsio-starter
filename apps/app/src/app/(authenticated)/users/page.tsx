import { database } from "@repo/database";
import { PageContainer } from "@/components/page-container";
import { UserList } from "./user-list";
import { CreateUserForm } from "./create-user-form";

export default async function UsersPage() {
  const users = await database.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <PageContainer title="Users">
      <div className="grid gap-6 p-4 lg:p-6">
        <CreateUserForm />
        <UserList users={users} />
      </div>
    </PageContainer>
  );
}
