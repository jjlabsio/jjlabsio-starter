"use client";

import * as React from "react";
import {
  IconPlus,
  IconSearch,
  IconDots,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { FilterSelect } from "@repo/ui/components/filter-select";
import { Card, CardContent } from "@repo/ui/components/card";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@repo/ui/components/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/components/dialog";
import {
  DataTable,
  DataTableText,
  DataTablePagination,
  useDataTable,
  type DataTableColumn,
} from "@repo/ui/components/data-table";

type Project = {
  id: string;
  name: string;
  aliases: string[];
  domains: string[];
  channel: string;
  color: number;
  entries: number;
};
const makeProject = (name: string, index: number): Project => ({
  id: `sample-${index}`,
  name,
  aliases: [name],
  domains: [
    index === 0
      ? "example.com"
      : `${name.toLowerCase().replaceAll(" ", "")}.example`,
  ],
  channel: "",
  color: (index % 5) + 1,
  entries: [202, 605, 442, 413, 384, 269, 221, 186, 129, 68][index] ?? 0,
});
const initialProjects = [
  "Customer Portal",
  "Public Website",
  "Mobile App",
  "Internal Console",
  "Help Center",
  "Partner Portal",
  "Status Page",
  "Reporting Dashboard",
  "Knowledge Base",
  "Community Hub",
].map(makeProject);
const initialSuggestions = [
  "Event Hub",
  "Feedback Board",
  "Documentation Site",
  "Scheduling App",
  "Inventory Console",
  "Training Portal",
  "Partner Directory",
  "Operations Dashboard",
].map((name, index) => ({
  ...makeProject(name, index + 10),
  entries: 166 - index * 13,
}));
const emptyProject: Project = {
  id: "",
  name: "",
  aliases: [""],
  domains: [""],
  channel: "",
  color: 1,
  entries: 0,
};
const storageKey = "starter-projects-preview-v1";

function validProject(value: unknown): value is Project {
  if (!value || typeof value !== "object") return false;
  const item = value as Project;
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    Array.isArray(item.aliases) &&
    item.aliases.every((text) => typeof text === "string") &&
    Array.isArray(item.domains) &&
    item.domains.every((text) => typeof text === "string") &&
    typeof item.channel === "string" &&
    Number.isInteger(item.color) &&
    item.color >= 1 &&
    item.color <= 5 &&
    Number.isFinite(item.entries)
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState(initialProjects);
  const [suggestions, setSuggestions] = React.useState(initialSuggestions);
  const [search, setSearch] = React.useState("");
  const [selectedProject, setSelectedProject] = React.useState<string | null>(
    null,
  );
  const [draft, setDraft] = React.useState<Project | null>(null);
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const [removing, setRemoving] = React.useState<Project | null>(null);
  const [discard, setDiscard] = React.useState(false);
  const original = React.useRef(emptyProject);
  const errorRef = React.useRef<HTMLDivElement>(null);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const formReturnFocus = React.useRef<HTMLElement | null>(null);
  const dirty =
    draft !== null &&
    JSON.stringify(draft) !== JSON.stringify(original.current);
  const filtered = React.useMemo(
    () =>
      projects.filter(
        (project) =>
          (selectedProject === null || project.id === selectedProject) &&
          [project.name, ...project.aliases, ...project.domains].some((value) =>
            value.toLowerCase().includes(search.trim().toLowerCase()),
          ),
      ),
    [projects, selectedProject, search],
  );

  React.useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  React.useEffect(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
      if (
        value &&
        Array.isArray(value.projects) &&
        value.projects.every(validProject) &&
        Array.isArray(value.suggestions) &&
        value.suggestions.every(validProject)
      ) {
        setProjects(value.projects);
        setSuggestions(value.suggestions);
      }
    } catch {
      setMessage("Preview storage is unavailable. Changes cannot be saved.");
    }
  }, []);

  const persist = React.useCallback(
    (nextProjects: Project[], nextSuggestions = suggestions) => {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            projects: nextProjects,
            suggestions: nextSuggestions,
          }),
        );
        setProjects(nextProjects);
        setSuggestions(nextSuggestions);
        setMessage("Changes saved in this browser tab.");
        return true;
      } catch {
        setError(
          "Could not save. Check your browser storage settings and try again.",
        );
        setMessage(
          "Could not save. Check your browser storage settings and try again.",
        );
        return false;
      }
    },
    [suggestions],
  );
  const edit = React.useCallback(
    (project: Project = emptyProject, trigger?: HTMLElement | null) => {
      formReturnFocus.current =
        trigger ??
        (document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null);
      original.current = project;
      setDraft(project);
      setError("");
    },
    [],
  );
  function close() {
    if (dirty) setDiscard(true);
    else setDraft(null);
  }
  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft) return;
    const name = draft.name.trim();
    const aliases = [
      ...new Set(draft.aliases.map((value) => value.trim()).filter(Boolean)),
    ];
    const domains = [
      ...new Set(
        draft.domains
          .map((value) => value.trim().toLowerCase())
          .filter(Boolean),
      ),
    ];
    if (!name) {
      setError("Enter a project name.");
      return;
    }
    if (
      projects.some(
        (project) =>
          project.id !== draft.id &&
          project.name.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setError("A project with this name already exists.");
      return;
    }
    if (
      domains.some(
        (domain) =>
          !/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(domain),
      )
    ) {
      setError(
        "Enter a domain such as example.com, without a protocol or path.",
      );
      return;
    }
    if (draft.channel.trim()) {
      try {
        const url = new URL(draft.channel);
        if (!["https:", "http:"].includes(url.protocol)) throw new Error();
      } catch {
        setError("Enter a resource URL starting with https:// or http://.");
        return;
      }
    }
    const item = {
      ...draft,
      name,
      aliases,
      domains,
      channel: draft.channel.trim(),
      id: draft.id || crypto.randomUUID(),
    };
    if (
      persist(
        draft.id
          ? projects.map((project) =>
              project.id === draft.id ? item : project,
            )
          : [...projects, item],
      )
    ) {
      if (!draft.id) {
        setSelectedProject(item.id);
        setSearch("");
      }
      setDraft(null);
    }
  }

  const columns = React.useMemo<DataTableColumn<Project>[]>(
    () => [
      {
        id: "color",
        header: "Color",
        enableSorting: false,
        meta: { layout: "compact", width: 120 },
        cell: ({ row }) => {
          const project = row.original;
          return (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Change ${project.name} color`}
                    />
                  }
                >
                  <span
                    className="ui-color-swatch"
                    style={{
                      background: `var(--chart-${project.color})`,
                    }}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {[1, 2, 3, 4, 5].map((color) => (
                    <DropdownMenuItem
                      key={color}
                      selected={project.color === color}
                      onClick={() =>
                        persist(
                          projects.map((item) =>
                            item.id === project.id ? { ...item, color } : item,
                          ),
                        )
                      }
                    >
                      <span
                        className="ui-color-swatch"
                        style={{ background: `var(--chart-${color})` }}
                      />
                      Color {color}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Display name",
        enableSorting: true,
        meta: { layout: "content", width: 240 },
        sortFn: "alphanumeric",
        cell: ({ row }) => {
          const project = row.original;
          return (
            <DataTableText
              primary={project.name}
              onClick={() => edit(project)}
              icon={
                <Avatar size="xs">
                  <AvatarFallback>{project.name[0]}</AvatarFallback>
                </Avatar>
              }
              trailing={
                project.id === "sample-0" ? (
                  <Badge variant="count">Primary</Badge>
                ) : undefined
              }
            />
          );
        },
      },
      {
        id: "aliases",
        accessorFn: (row) => row.aliases.join(", "),
        header: "Short names",
        enableSorting: true,
        meta: { layout: "compact", width: 180, wrap: true },
        sortFn: "alphanumeric",
        cell: ({ row }) => {
          const project = row.original;
          return <>{project.aliases.join(", ")}</>;
        },
      },
      {
        id: "domains",
        accessorFn: (row) => row.domains.join(", "),
        header: "Domains",
        enableSorting: true,
        meta: { layout: "compact", width: 200, wrap: true },
        sortFn: "alphanumeric",
        cell: ({ row }) => {
          const project = row.original;
          return <>{project.domains.join(", ") || "—"}</>;
        },
      },
      {
        accessorKey: "channel",
        header: "Resources",
        enableSorting: true,
        meta: { layout: "compact" },
        sortFn: "alphanumeric",
        cell: ({ row }) => {
          const project = row.original;
          return (
            <>
              <Button variant="dashed" size="sm" onClick={() => edit(project)}>
                {project.channel ? (
                  "Edit resource"
                ) : (
                  <>
                    <IconPlus />
                    Add resource
                  </>
                )}
              </Button>
            </>
          );
        },
      },
      {
        accessorKey: "entries",
        header: "Items",
        enableSorting: true,
        sortFn: "basic",
        meta: { numeric: true },
        enableGlobalFilter: false,
        cell: ({ row }) => {
          const project = row.original;
          return <>{project.entries}</>;
        },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        meta: { layout: "actions" },
        cell: ({ row }) => {
          const project = row.original;
          return (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`Actions for ${project.name}`}
                    />
                  }
                >
                  <IconDots />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => edit(project)}>
                    Edit project
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => {
                      setError("");
                      setRemoving(project);
                    }}
                  >
                    Delete project
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          );
        },
      },
    ],
    [projects, edit, persist],
  );
  const table = useDataTable({
    processing: "client",
    queryKey: JSON.stringify([search, selectedProject]),
    data: filtered,
    columns,
    getRowId: (row) => row.id,
  });

  return (
    <PageContainer
      title={`Your projects · ${projects.length}`}
      spacing="canvas"
      actions={
        <Button onClick={() => edit()}>
          <IconPlus aria-hidden="true" /> Add project
        </Button>
      }
    >
      <div className="ui-master-detail">
        <div className="ui-master-list">
          <div className="ui-list-toolbar">
            <InputGroup className="max-w-60">
              <InputGroupAddon>
                <IconSearch />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search projects"
                placeholder="Search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </InputGroup>
            <FilterSelect
              label="Project"
              allLabel="All projects"
              value={selectedProject}
              options={projects.map((project) => ({
                value: project.id,
                label: project.name,
              }))}
              onValueChange={setSelectedProject}
              searchable
              searchPlaceholder="Search projects..."
              emptyMessage="No matching projects."
              reset={false}
              onCreate={{
                label: "Add project",
                onClick: (trigger) => edit(emptyProject, trigger),
              }}
            />
          </div>
          <div className="ui-list-scroll">
            <DataTable
              table={table}
              label="projects"
              minWidth={1000}
              emptyMessage={
                projects.length
                  ? "No projects match your search."
                  : "No projects yet. Add a project to get started."
              }
            />
          </div>
          <DataTablePagination table={table} label="projects">
            <span role="status">
              {message || "Example data · saved only in this browser tab"}
            </span>
          </DataTablePagination>
        </div>
        <aside className="ui-support-rail" aria-label="Sample projects">
          <h2 className="ui-support-title">
            Sample projects <span>· {suggestions.length}</span>
          </h2>
          {suggestions.map((project) => (
            <Card key={project.id} size="sm">
              <CardContent className="ui-compact-record">
                <p data-slot="record-meta">{project.entries} items</p>
                <p data-slot="record-name">
                  <Avatar size="xs">
                    <AvatarFallback>{project.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{project.name}</span>
                </p>
                <div>
                  <Badge variant="status" size="sm">
                    {project.domains[0]}
                  </Badge>
                </div>
                <div data-slot="record-actions">
                  <Button
                    variant="secondary"
                    size="icon-sm"
                    aria-label={`Dismiss ${project.name}`}
                    onClick={() =>
                      persist(
                        projects,
                        suggestions.filter((item) => item.id !== project.id),
                      )
                    }
                  >
                    <IconX />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon-sm"
                    aria-label={`Add ${project.name}`}
                    onClick={() => {
                      if (
                        projects.some(
                          (item) =>
                            item.name.toLowerCase() ===
                            project.name.toLowerCase(),
                        )
                      ) {
                        setMessage("This project is already in your list.");
                        return;
                      }
                      persist(
                        [...projects, project],
                        suggestions.filter((item) => item.id !== project.id),
                      );
                    }}
                  >
                    <IconCheck />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {suggestions.length === 0 && (
            <p className="ui-page-description">All sample projects reviewed.</p>
          )}
        </aside>
      </div>

      <Sheet
        open={draft !== null}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <SheetContent
          variant="form"
          showCloseButton={false}
          initialFocus={nameRef}
          finalFocus={formReturnFocus}
        >
          <SheetHeader>
            <SheetTitle>
              {draft?.id ? "Edit project" : "Add project"}
            </SheetTitle>
            <SheetDescription>
              {draft?.id ? "Edit" : "Create"} a sample project. Changes stay in
              this browser tab.
            </SheetDescription>
          </SheetHeader>
          {draft && (
            <form onSubmit={save}>
              <div className="ui-form-scroll">
                <div
                  className="ui-identity-cover"
                  data-tone="muted"
                  aria-hidden="true"
                />
                <div className="ui-identity-summary">
                  <Avatar size="profile">
                    <AvatarFallback>{draft.name[0] ?? ""}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ui-form-fields">
                  <Field density="comfortable">
                    <FieldLabel
                      htmlFor="project-name"
                      help="The name displayed in your project list."
                    >
                      Display name
                    </FieldLabel>
                    <Input
                      id="project-name"
                      ref={nameRef}
                      value={draft.name}
                      placeholder="Project name"
                      required
                      maxLength={80}
                      onChange={(event) => {
                        setDraft({ ...draft, name: event.target.value });
                        setError("");
                      }}
                    />
                  </Field>
                  {(["aliases", "domains"] as const).map((key) => (
                    <section key={key} className="ui-form-section">
                      <Field density="comfortable">
                        <FieldLabel id={`${key}-heading`}>
                          {key === "aliases" ? "Short names" : "Domains"}
                        </FieldLabel>
                        {key === "aliases" && (
                          <FieldDescription>
                            Optional short names for this project.
                          </FieldDescription>
                        )}
                        {draft[key].map((value, index) => (
                          <div className="flex items-center gap-2" key={index}>
                            <Input
                              aria-label={`${key === "aliases" ? "Short name" : "Domain"} ${index + 1}`}
                              placeholder={
                                key === "aliases" ? "Short name" : "example.com"
                              }
                              value={value}
                              maxLength={253}
                              onChange={(event) => {
                                setDraft({
                                  ...draft,
                                  [key]: draft[key].map((entry, at) =>
                                    at === index ? event.target.value : entry,
                                  ),
                                });
                                setError("");
                              }}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Remove ${key === "aliases" ? "short name" : "domain"} ${index + 1}`}
                              onClick={() =>
                                setDraft({
                                  ...draft,
                                  [key]: draft[key].filter(
                                    (_, at) => at !== index,
                                  ),
                                })
                              }
                            >
                              <IconX />
                            </Button>
                          </div>
                        ))}
                        <div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              setDraft({ ...draft, [key]: [...draft[key], ""] })
                            }
                          >
                            <IconPlus />
                            {key === "aliases"
                              ? "Add short name"
                              : "Add alternative domain"}
                          </Button>
                        </div>
                      </Field>
                    </section>
                  ))}
                  <section className="ui-form-section">
                    <Field density="comfortable">
                      <FieldLabel htmlFor="project-channel">
                        Resource URL
                      </FieldLabel>
                      <FieldDescription>
                        A useful link for this project, such as its
                        documentation.
                      </FieldDescription>
                      <Input
                        id="project-channel"
                        type="url"
                        value={draft.channel}
                        placeholder="https://"
                        onChange={(event) => {
                          setDraft({ ...draft, channel: event.target.value });
                          setError("");
                        }}
                      />
                    </Field>
                  </section>
                  {error && (
                    <FieldError ref={errorRef} tabIndex={-1}>
                      {error}
                    </FieldError>
                  )}
                </div>
              </div>
              <SheetFooter>
                <Button type="button" variant="outline" onClick={close}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!dirty}>
                  {draft.id ? "Save changes" : "Create"}
                </Button>
              </SheetFooter>
            </form>
          )}
        </SheetContent>
      </Sheet>
      <Dialog
        open={!!removing}
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete {removing?.name}?</DialogTitle>
            <DialogDescription>
              This removes the project from this browser tab’s example data.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <FieldError ref={errorRef} tabIndex={-1}>
              {error}
            </FieldError>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoving(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (
                  persist(
                    projects.filter((project) => project.id !== removing?.id),
                  )
                ) {
                  if (selectedProject === removing?.id)
                    setSelectedProject(null);
                  setRemoving(null);
                }
              }}
            >
              Delete project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={discard} onOpenChange={setDiscard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard changes?</DialogTitle>
            <DialogDescription>
              Your unsaved project edits will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscard(false)}>
              Keep editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setDiscard(false);
                setDraft(null);
              }}
            >
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
