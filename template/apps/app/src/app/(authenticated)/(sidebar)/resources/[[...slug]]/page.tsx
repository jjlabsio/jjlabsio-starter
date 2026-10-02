import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import {
  projectBreadcrumbs,
  projectsNavigation,
} from "@/domains/sidebar/lib/navigation";
import {
  exampleProjects,
  examplePages,
} from "@/domains/sidebar/lib/resource-examples";
import { ResourceRecords } from "./records";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { Button } from "@repo/ui/components/button";

export default async function ResourcesPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug = [] } = await params;
  if (!slug.length) redirect(projectsNavigation.href);
  if (
    slug[0] !== "projects" ||
    slug.length > 4 ||
    (slug.length >= 3 && slug[2] !== "pages")
  )
    notFound();
  const project = slug[1]
    ? exampleProjects.find((item) => item.id === slug[1])
    : undefined;
  if (slug[1] && !project) notFound();
  const pages = examplePages.filter((item) => item.projectId === project?.id);
  const page = slug[3] ? pages.find((item) => item.id === slug[3]) : undefined;
  if (slug[3] && !page) notFound();
  const projectHref = `${projectsNavigation.href}/${project?.id}`;
  const details = project ? [{ label: project.name, href: projectHref }] : [];
  if (slug[2]) details.push({ label: "Pages", href: `${projectHref}/pages` });
  if (page)
    details.push({ label: page.name, href: `${projectHref}/pages/${page.id}` });
  const title =
    page?.name ?? (slug[2] ? "Pages" : (project?.name ?? "Projects"));
  const rows = project
    ? pages.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.path,
        status: item.status,
        detail: `${item.views.toLocaleString("en-US")} views`,
        href: `${projectHref}/pages/${item.id}`,
      }))
    : exampleProjects.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        status: item.status,
        detail: item.owner,
        href: `${projectsNavigation.href}/${item.id}`,
      }));
  return (
    <PageContainer title={title} breadcrumbs={projectBreadcrumbs(details)}>
      {project && !slug[2] && (
        <Card>
          <CardHeader>
            <CardTitle>Project details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="ui-settings-details">
              <div>
                <dt>Owner</dt>
                <dd>{project.owner}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{project.status}</dd>
              </div>
              <div>
                <dt>Pages</dt>
                <dd>{pages.length}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      )}
      {page ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Page details</CardTitle>
              <CardDescription>{project?.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="ui-settings-details">
                <div>
                  <dt>Status</dt>
                  <dd>{page.status}</dd>
                </div>
                <div>
                  <dt>Views</dt>
                  <dd>{page.views.toLocaleString("en-US")}</dd>
                </div>
                <div>
                  <dt>Updated</dt>
                  <dd>{page.updated}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="type-ui-body">{page.content}</p>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card variant="panel">
          <CardHeader>
            <CardTitle>{project ? "Pages" : "All projects"}</CardTitle>
            {project && !slug[2] && (
              <Button
                variant="ghost"
                size="sm"
                nativeButton={false}
                render={<Link href={`${projectHref}/pages`} />}
              >
                View all pages
              </Button>
            )}
          </CardHeader>
          <CardContent padding="none">
            <ResourceRecords
              rows={rows}
              label={project ? "pages" : "projects"}
            />
          </CardContent>
        </Card>
      )}
    </PageContainer>
  );
}
