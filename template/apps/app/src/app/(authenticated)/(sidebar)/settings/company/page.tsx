"use client";

import * as React from "react";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Field, FieldLabel } from "@repo/ui/components/field";
import { Switch } from "@repo/ui/components/switch";
import { Skeleton } from "@repo/ui/components/skeleton";

const previews = [
  {
    title: "Workspace views",
    description:
      "Choose the information your team sees when opening a workspace.",
  },
  {
    title: "Saved views",
    description: "Keep useful filter combinations ready for your team.",
  },
  {
    title: "Workflow suggestions",
    description:
      "See recommended next steps alongside your workspace activity.",
  },
  {
    title: "Weekly summaries",
    description: "Review a short digest of changes across your workspace.",
  },
  {
    title: "Data connectors",
    description: "Bring information from the tools your team already uses.",
  },
];

export default function CompanySettingsPage() {
  const [name, setName] = React.useState("Example Workspace");
  const [domain, setDomain] = React.useState("example.com");
  const [emailReports, setEmailReports] = React.useState(true);
  const [earlyAccess, setEarlyAccess] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState("");
  const [ready, setReady] = React.useState(false);
  const savedCompany = React.useRef({
    name: "Example Workspace",
    domain: "example.com",
  });
  const storageKey = "starter-company-preview-v1";
  React.useEffect(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
      if (
        value &&
        typeof value.name === "string" &&
        typeof value.domain === "string"
      ) {
        setName(value.name);
        setDomain(value.domain);
        savedCompany.current = { name: value.name, domain: value.domain };
        setEmailReports(value.emailReports === true);
        setEarlyAccess(value.earlyAccess === true);
      }
    } catch {
      setError("Preview storage is unavailable. You can still edit this page.");
    } finally {
      setReady(true);
    }
  }, []);

  function persist(next: {
    name: string;
    domain: string;
    emailReports: boolean;
    earlyAccess: boolean;
  }) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(next));
      savedCompany.current = { name: next.name, domain: next.domain };
      const formSaved =
        next.name === name.trim() && next.domain === domain.trim();
      setSaved(formSaved);
      if (formSaved) setError("");
    } catch {
      setSaved(false);
      setError("Could not save. Your changes are still on this page.");
    }
  }

  function savePreview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !name.trim() ||
      !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain.trim())
    ) {
      setError("Enter a company name and a domain such as example.com.");
      setSaved(false);
      return;
    }
    persist({
      name: name.trim(),
      domain: domain.trim(),
      emailReports,
      earlyAccess,
    });
  }

  if (!ready) {
    return (
      <PageContainer title="Company" spacing="settings">
        <Skeleton
          role="status"
          aria-label="Loading company settings"
          className="h-60 w-full"
        />
        <Skeleton aria-hidden="true" className="h-40 w-full" />
        <Skeleton aria-hidden="true" className="h-96 w-full" />
      </PageContainer>
    );
  }

  return (
    <PageContainer title="Company" spacing="settings">
      <Card variant="form">
        <CardHeader>
          <CardTitle>Edit company</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePreview} className="space-y-4">
            <Field density="compact">
              <FieldLabel htmlFor="company-name">Name</FieldLabel>
              <Input
                id="company-name"
                value={name}
                onChange={(event) => {
                  setName(event.target.value);
                  setSaved(false);
                }}
                required
              />
            </Field>
            <Field density="compact">
              <FieldLabel htmlFor="company-domain">Domain</FieldLabel>
              <Input
                id="company-domain"
                value={domain}
                onChange={(event) => {
                  setDomain(event.target.value);
                  setSaved(false);
                }}
                required
              />
            </Field>
            <div className="flex flex-wrap items-center justify-end gap-3">
              {error && (
                <p role="alert" className="type-ui-body text-destructive">
                  {error}
                </p>
              )}
              {saved && (
                <span
                  role="status"
                  className="type-ui-caption text-muted-foreground"
                >
                  Saved in this browser tab
                </span>
              )}
              <Button type="submit">
                <IconDeviceFloppy aria-hidden="true" /> Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card variant="settings">
        <CardHeader>
          <CardTitle>Email preferences</CardTitle>
          <CardDescription>
            Choose whether to receive a workspace summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Switch
              checked={emailReports}
              onCheckedChange={(checked) => {
                setEmailReports(checked);
                persist({
                  ...savedCompany.current,
                  emailReports: checked,
                  earlyAccess,
                });
              }}
              aria-label="Email reports"
            />
            <span className="type-ui-body-medium">Email reports</span>
          </div>
          <Badge variant="status">
            {emailReports ? "Every 2 weeks" : "Paused"}
          </Badge>
        </CardContent>
      </Card>

      <Card variant="settings">
        <CardHeader>
          <CardTitle>Early access</CardTitle>
        </CardHeader>
        <CardContent className="ui-settings-details">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <Switch
              checked={earlyAccess}
              onCheckedChange={(checked) => {
                setEarlyAccess(checked);
                persist({
                  ...savedCompany.current,
                  emailReports,
                  earlyAccess: checked,
                });
              }}
              aria-label="Activate previews"
            />
            <span className="type-ui-body-medium">Activate previews</span>
          </div>
          <div className="ui-settings-details">
            {previews.map((preview) => (
              <div key={preview.title}>
                <p className="ui-list-primary">{preview.title}</p>
                <p className="ui-list-secondary mt-0.5">
                  {preview.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
