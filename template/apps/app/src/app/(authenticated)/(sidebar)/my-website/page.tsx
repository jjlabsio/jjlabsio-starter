import Link from "next/link";
import { IconArrowRight, IconWorld } from "@tabler/icons-react";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { SectionCards } from "@/domains/sidebar/components/section-cards";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";

const websiteMetrics = [
  { label: "Pages", value: "24" },
  { label: "Indexed", value: "21" },
  { label: "Needs review", value: "3" },
];

const pages = [
  { path: "/", title: "Home", status: "Indexed" },
  { path: "/features", title: "Features", status: "Indexed" },
  { path: "/pricing", title: "Pricing", status: "Needs review" },
];

export default function MyWebsitePage() {
  return (
    <PageContainer
      title="My website"
      spacing="default"
      actions={<Badge variant="outline">Example data</Badge>}
    >
      <Card variant="panel">
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          <span className="flex size-9 items-center justify-center rounded-md bg-muted">
            <IconWorld className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="ui-list-primary">example.com</p>
            <p className="ui-list-secondary">Connected website</p>
          </div>
          <Badge variant="outline">Connected</Badge>
        </CardContent>
      </Card>

      <SectionCards metrics={websiteMetrics} />

      <Card variant="panel">
        <CardHeader>
          <CardTitle>Pages</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul>
            {pages.map((page) => (
              <li key={page.path} className="ui-list-row" data-layout="details">
                <IconWorld
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <p className="ui-list-primary">{page.title}</p>
                  <p className="ui-list-secondary">{page.path}</p>
                </div>
                <span data-slot="row-meta">
                  <Badge variant="outline">{page.status}</Badge>
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        nativeButton={false}
        render={<Link href="/" />}
        className="self-start"
      >
        View overview
        <IconArrowRight aria-hidden="true" />
      </Button>
    </PageContainer>
  );
}
