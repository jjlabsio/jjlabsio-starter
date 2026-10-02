"use client";

import * as React from "react";
import { IconFilter, IconPlus, IconSearch } from "@tabler/icons-react";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { SectionCards } from "@/domains/sidebar/components/section-cards";
import { Button } from "@repo/ui/components/button";
import { DateRangePicker } from "@repo/ui/components/date-range-picker";
import { FilterSelect } from "@repo/ui/components/filter-select";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import { Input } from "@repo/ui/components/input";
import { Field, FieldLabel, FieldError } from "@repo/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
import { Label } from "@repo/ui/components/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@repo/ui/components/select";
import {
  DataTable,
  DataTablePagination,
  useDataTable,
  type DataTableColumn,
} from "@repo/ui/components/data-table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";

type RequestStatus = "open" | "planned" | "archived";
type RequestItem = {
  id: number;
  text: string;
  category: string;
  status: RequestStatus;
  completed: number;
  subtasks: number;
  priority: number | null;
  attachments: number;
  daysAgo: number;
};

function requestProgress(request: RequestItem) {
  return request.subtasks
    ? Math.round((request.completed / request.subtasks) * 100)
    : 0;
}

const requestColumns: DataTableColumn<RequestItem>[] = [
  {
    accessorKey: "text",
    header: "Request",
    enableSorting: true,
    sortFn: "alphanumeric",
    meta: { width: 330, text: "primary", wrap: true },
  },
  {
    id: "progress",
    accessorFn: requestProgress,
    header: "Progress",
    enableSorting: true,
    sortFn: "basic",
    enableGlobalFilter: false,
    meta: { numeric: true },
    cell: (info) => `${info.getValue<number>()}%`,
  },
  {
    accessorKey: "completed",
    header: "Completed",
    enableSorting: true,
    sortFn: "basic",
    enableGlobalFilter: false,
    meta: { numeric: true },
  },
  {
    id: "remaining",
    accessorFn: (request) => request.subtasks - request.completed,
    header: "Remaining",
    enableSorting: true,
    sortFn: "basic",
    enableGlobalFilter: false,
    meta: { numeric: true },
  },
  {
    accessorFn: (request) => request.priority ?? undefined,
    id: "priority",
    header: "Priority",
    enableSorting: true,
    sortFn: "basic",
    sortUndefined: "last",
    enableGlobalFilter: false,
    meta: { layout: "compact" },
    cell: (info) =>
      ({ 1: "Low", 2: "Normal", 3: "High" })[info.getValue<number>()] ?? "–",
  },
  {
    accessorKey: "attachments",
    header: "Attachments",
    enableSorting: false,
    enableGlobalFilter: false,
    meta: { numeric: true },
  },
  {
    accessorKey: "subtasks",
    header: "Items",
    enableSorting: true,
    sortFn: "basic",
    enableGlobalFilter: false,
    meta: { numeric: true },
  },
  {
    accessorKey: "category",
    header: "Category",
    enableSorting: false,
    enableGlobalFilter: false,
    meta: { layout: "compact", width: 180, text: "secondary" },
  },
];

const initialRequests: RequestItem[] = [
  {
    id: 1,
    text: "Update account notification settings",
    category: "Operations",
    status: "open",
    completed: 3,
    subtasks: 8,
    priority: 2,
    attachments: 1,
    daysAgo: 1,
  },
  {
    id: 2,
    text: "Invite the new team members",
    category: "Operations",
    status: "open",
    completed: 2,
    subtasks: 6,
    priority: 3,
    attachments: 0,
    daysAgo: 2,
  },
  {
    id: 3,
    text: "Prepare the next release checklist",
    category: "Delivery",
    status: "open",
    completed: 5,
    subtasks: 12,
    priority: 3,
    attachments: 3,
    daysAgo: 3,
  },
  {
    id: 4,
    text: "Resolve the account access request",
    category: "Support",
    status: "open",
    completed: 1,
    subtasks: 4,
    priority: 3,
    attachments: 2,
    daysAgo: 5,
  },
  {
    id: 5,
    text: "Review the monthly expense report",
    category: "Operations",
    status: "open",
    completed: 4,
    subtasks: 10,
    priority: 2,
    attachments: 2,
    daysAgo: 8,
  },
  {
    id: 6,
    text: "Schedule a customer onboarding session",
    category: "Support",
    status: "open",
    completed: 3,
    subtasks: 5,
    priority: 2,
    attachments: 1,
    daysAgo: 9,
  },
  {
    id: 7,
    text: "Set up the staging environment",
    category: "Delivery",
    status: "open",
    completed: 0,
    subtasks: 7,
    priority: null,
    attachments: 0,
    daysAgo: 12,
  },
  {
    id: 8,
    text: "Confirm the quarterly team schedule",
    category: "Operations",
    status: "open",
    completed: 2,
    subtasks: 8,
    priority: 1,
    attachments: 1,
    daysAgo: 14,
  },
  {
    id: 12,
    text: "Organize the shared project documents",
    category: "Operations",
    status: "open",
    completed: 5,
    subtasks: 9,
    priority: 2,
    attachments: 4,
    daysAgo: 2,
  },
  {
    id: 13,
    text: "Review changes for the next release",
    category: "Delivery",
    status: "open",
    completed: 4,
    subtasks: 11,
    priority: 3,
    attachments: 2,
    daysAgo: 4,
  },
  {
    id: 14,
    text: "Approve the equipment purchase request",
    category: "Operations",
    status: "open",
    completed: 1,
    subtasks: 3,
    priority: 2,
    attachments: 1,
    daysAgo: 6,
  },
  {
    id: 15,
    text: "Follow up on the service incident",
    category: "Support",
    status: "open",
    completed: 3,
    subtasks: 6,
    priority: 3,
    attachments: 2,
    daysAgo: 7,
  },
  {
    id: 16,
    text: "Review the deployment checklist",
    category: "Delivery",
    status: "open",
    completed: 6,
    subtasks: 14,
    priority: 2,
    attachments: 3,
    daysAgo: 11,
  },
  {
    id: 17,
    text: "Prepare the customer handover notes",
    category: "Support",
    status: "open",
    completed: 2,
    subtasks: 5,
    priority: 1,
    attachments: 1,
    daysAgo: 13,
  },
  {
    id: 18,
    text: "Refresh the internal team directory",
    category: "Operations",
    status: "open",
    completed: 4,
    subtasks: 8,
    priority: 1,
    attachments: 0,
    daysAgo: 15,
  },
  {
    id: 19,
    text: "Verify the backup and recovery checklist",
    category: "Delivery",
    status: "open",
    completed: 2,
    subtasks: 9,
    priority: 3,
    attachments: 2,
    daysAgo: 18,
  },
  {
    id: 9,
    text: "Plan the next onboarding workshop",
    category: "Operations",
    status: "planned",
    completed: 0,
    subtasks: 6,
    priority: 2,
    attachments: 1,
    daysAgo: 0,
  },
  {
    id: 10,
    text: "Prepare the quarterly service review",
    category: "Support",
    status: "planned",
    completed: 0,
    subtasks: 8,
    priority: 1,
    attachments: 0,
    daysAgo: 0,
  },
  {
    id: 11,
    text: "Replace the billing contact details",
    category: "Delivery",
    status: "archived",
    completed: 4,
    subtasks: 4,
    priority: 2,
    attachments: 1,
    daysAgo: 30,
  },
];

const initialCategories = ["Operations", "Delivery", "Support"];
const statuses: { value: RequestStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "planned", label: "Planned" },
  { value: "archived", label: "Archived" },
];

function requestDate(daysAgo: number) {
  return new Date(2026, 8, 19 - daysAgo);
}
const requestPresets = [
  { label: "All time", range: { from: requestDate(30), to: requestDate(0) } },
  { label: "Last 7 days", range: { from: requestDate(6), to: requestDate(0) } },
];

export default function RequestsPage() {
  const [requests, setRequests] = React.useState(initialRequests);
  const [categories, setCategories] = React.useState(initialCategories);
  const [status, setStatus] = React.useState<RequestStatus>("open");
  const [category, setCategory] = React.useState("All categories");
  const [dateRange, setDateRange] = React.useState(requestPresets[0]!.range);
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<number[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [draft, setDraft] = React.useState("");
  const [draftCategory, setDraftCategory] = React.useState(
    initialCategories[0]!,
  );
  const [categoryDialogOpen, setCategoryDialogOpen] = React.useState(false);
  const [newCategory, setNewCategory] = React.useState("");
  const categoryNameRef = React.useRef<HTMLInputElement>(null);
  const categoryReturnFocus = React.useRef<HTMLElement | null>(null);
  const duplicateCategory = ["All categories", ...categories].some(
    (item) => item.toLowerCase() === newCategory.trim().toLowerCase(),
  );

  function openCategoryDialog(trigger: HTMLElement | null) {
    categoryReturnFocus.current = trigger;
    setNewCategory("");
    setCategoryDialogOpen(true);
  }

  const tableData = React.useMemo(
    () =>
      requests.filter(
        (request) =>
          request.status === status &&
          (category === "All categories" || request.category === category) &&
          requestDate(request.daysAgo) >= dateRange.from &&
          requestDate(request.daysAgo) <= dateRange.to,
      ),
    [requests, status, category, dateRange],
  );
  const selection = React.useMemo(
    () => Object.fromEntries(selected.map((id) => [String(id), true as const])),
    [selected],
  );
  const table = useDataTable({
    processing: "client",
    queryKey: JSON.stringify([status, category, dateRange]),
    data: tableData,
    columns: requestColumns,
    getRowId: (row) => String(row.id),
    state: { rowSelection: selection, globalFilter: query },
    onGlobalFilterChange: setQuery,
    onRowSelectionChange: (updater) =>
      setSelected((current) => {
        const previous = Object.fromEntries(
          current.map((id) => [String(id), true as const]),
        );
        const next =
          typeof updater === "function" ? updater(previous) : updater;
        return Object.keys(next)
          .filter((id) => next[id])
          .map(Number);
      }),
  });
  const visibleRequests = table
    .getPrePaginatedRowModel()
    .rows.map((row) => row.original);

  function selectCategory(next: string) {
    setCategory(next);
    setSelected([]);
  }

  function addRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    setRequests((current) => [
      {
        id: Date.now(),
        text,
        category: draftCategory,
        status: "open",
        completed: 0,
        subtasks: 0,
        priority: null,
        attachments: 0,
        daysAgo: 0,
      },
      ...current,
    ]);
    setStatus("open");
    setCategory("All categories");
    setDateRange(requestPresets[0]!.range);
    table.setGlobalFilter("");
    setSelected([]);
    setDraft("");
    setDialogOpen(false);
  }

  function addCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = newCategory.trim();
    if (
      !next ||
      ["All categories", ...categories].some(
        (item) => item.toLowerCase() === next.toLowerCase(),
      )
    )
      return;
    setCategories((current) => [...current, next]);
    setDraftCategory(next);
    selectCategory(next);
    table.setGlobalFilter("");
    setNewCategory("");
    setCategoryDialogOpen(false);
  }

  return (
    <PageContainer
      title="Requests"
      spacing="canvas"
      toolbar={
        <>
          <DateRangePicker
            value={dateRange}
            presets={requestPresets}
            minDate={requestPresets[0]!.range.from}
            maxDate={requestPresets[0]!.range.to}
            onValueChange={(range) => {
              setDateRange(range);
              setSelected([]);
            }}
          />
          <FilterSelect
            label="Category"
            allLabel="All categories"
            icon={<IconFilter aria-hidden="true" />}
            value={category === "All categories" ? null : category}
            options={categories.map((value) => ({ value, label: value }))}
            onValueChange={(value) => selectCategory(value ?? "All categories")}
            searchable
            reset={false}
            onCreate={{ label: "New category", onClick: openCategoryDialog }}
          />
        </>
      }
    >
      <div className="grid min-h-(--page-content-height) min-w-0 lg:h-(--page-content-height) lg:min-h-0 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside
          className="hidden border-r border-border lg:block lg:min-h-0 lg:overflow-y-auto"
          aria-label="Request categories"
        >
          <div className="ui-topic-heading">
            <span>Categories</span>
            <span className="type-ui-caption text-muted-foreground">
              {categories.length}
            </span>
          </div>
          <div className="ui-topic-create">
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={(event) => openCategoryDialog(event.currentTarget)}
            >
              New category <IconPlus aria-hidden="true" />
            </Button>
          </div>
          <div className="ui-topic-menu">
            {["All categories", ...categories].map((item) => (
              <Button
                key={item}
                variant={category === item ? "secondary" : "ghost"}
                size="sm"
                className="w-full justify-between"
                aria-pressed={category === item}
                onClick={() => selectCategory(item)}
              >
                <span className="truncate">{item}</span>
                <span className="type-ui-caption text-muted-foreground">
                  {
                    requests.filter(
                      (request) =>
                        request.status === status &&
                        (item === "All categories" ||
                          request.category === item),
                    ).length
                  }
                </span>
              </Button>
            ))}
          </div>
        </aside>
        <Tabs
          value={status}
          onValueChange={(value) => {
            setStatus(value as RequestStatus);
            setSelected([]);
          }}
          className="min-w-0 gap-0 lg:min-h-0 lg:overflow-hidden"
        >
          <div className="ui-tab-toolbar">
            <TabsList variant="line">
              {statuses.map((item) => (
                <TabsTrigger key={item.value} value={item.value}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button size="sm" />}>
                <IconPlus aria-hidden="true" /> Add request
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add request</DialogTitle>
                  <DialogDescription>
                    Add an example request to this preview. It resets when the
                    page reloads.
                  </DialogDescription>
                </DialogHeader>
                <form
                  id="add-request-form"
                  onSubmit={addRequest}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="request-text">Request</Label>
                    <Input
                      id="request-text"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder="e.g. Update account settings"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="request-category">Category</Label>
                    <Select
                      value={draftCategory}
                      items={categories.map((value) => ({
                        value,
                        label: value,
                      }))}
                      onValueChange={(value) => {
                        if (value) setDraftCategory(value);
                      }}
                    >
                      <SelectTrigger id="request-category" className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {categories.map((value) => (
                            <SelectItem key={value} value={value}>
                              {value}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </form>
                <DialogFooter>
                  <DialogClose
                    render={<Button variant="outline" type="button" />}
                  >
                    Cancel
                  </DialogClose>
                  <Button type="submit" form="add-request-form">
                    Add request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <div className="ui-list-toolbar">
            <InputGroup className="max-w-60">
              <InputGroupAddon>
                <IconSearch aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                aria-label="Search requests"
                placeholder="Search requests"
                value={query}
                onChange={(event) => table.setGlobalFilter(event.target.value)}
              />
            </InputGroup>
            <div className="hidden min-w-0 md:block">
              <SectionCards
                variant="summary"
                metrics={[
                  {
                    label: "Progress",
                    value: `${Math.round((visibleRequests.reduce((sum, request) => sum + request.completed, 0) / (visibleRequests.reduce((sum, request) => sum + request.subtasks, 0) || 1)) * 100)}%`,
                  },
                  {
                    label: "Open items",
                    value: String(
                      visibleRequests.reduce(
                        (sum, request) =>
                          sum + request.subtasks - request.completed,
                        0,
                      ),
                    ),
                  },
                  {
                    label: "Requests",
                    value: String(visibleRequests.length),
                  },
                ]}
              />
            </div>
          </div>
          {statuses.map((item) => (
            <TabsContent
              key={item.value}
              value={item.value}
              className="min-w-0 lg:min-h-0 lg:overflow-y-auto"
            >
              <DataTable
                table={table}
                label="requests"
                selectable
                rowLabel={(row) => row.text}
                minWidth={1320}
                emptyMessage="No requests match these filters."
              />
            </TabsContent>
          ))}
          <DataTablePagination table={table} label="requests" />
        </Tabs>
      </div>
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent
          variant="form"
          initialFocus={categoryNameRef}
          finalFocus={categoryReturnFocus}
        >
          <DialogHeader>
            <DialogTitle>New category</DialogTitle>
            <DialogDescription>
              Create a category for this preview. It resets when the page
              reloads.
            </DialogDescription>
          </DialogHeader>
          <form id="add-category-form" onSubmit={addCategory}>
            <Field density="compact" data-invalid={duplicateCategory}>
              <FieldLabel htmlFor="new-category-name">Category name</FieldLabel>
              <Input
                id="new-category-name"
                ref={categoryNameRef}
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                placeholder="e.g. Operations"
                required
                maxLength={80}
                aria-invalid={duplicateCategory}
                aria-describedby={
                  duplicateCategory ? "category-name-error" : undefined
                }
              />
              {duplicateCategory && (
                <FieldError id="category-name-error">
                  A category with this name already exists.
                </FieldError>
              )}
            </Field>
          </form>
          <DialogFooter variant="form">
            <DialogClose render={<Button variant="outline" type="button" />}>
              Cancel
            </DialogClose>
            <Button
              type="submit"
              form="add-category-form"
              disabled={!newCategory.trim() || duplicateCategory}
            >
              <IconPlus aria-hidden="true" />
              Add category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
