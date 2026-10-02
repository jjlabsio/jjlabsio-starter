"use client";
import * as React from "react";
import {
  IconCheck,
  IconX,
  IconCircle,
  IconCircleDot,
  IconCircleCheckFilled,
  IconCircleXFilled,
  IconChartBar,
  IconHierarchy,
  IconNotes,
  IconSearch,
} from "@tabler/icons-react";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { SectionCards } from "@/domains/sidebar/components/section-cards";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { CaretIcon } from "@repo/ui/components/caret-icon";
import { Checkbox } from "@repo/ui/components/checkbox";
import { FilterSelect, FilterSelectList, FilterMenu } from "@repo/ui/components/filter-select";
import {
  DropdownMenuSeparator,
} from "@repo/ui/components/dropdown-menu";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group";
type ActionStatus = "New" | "In progress" | "Done" | "Declined";
type Action = {
  id: number;
  title: string;
  category:
    | "Content brief"
    | "Site improvements"
    | "Social updates"
    | "Outreach";
  format: string;
  status: ActionStatus;
};

const initialActions: Action[] = [
  {
    id: 11,
    title: "Share the new onboarding checklist",
    category: "Social updates",
    format: "Social post",
    status: "New",
  },
  {
    id: 12,
    title: "Publish a customer workflow tip",
    category: "Social updates",
    format: "Social post",
    status: "New",
  },
  {
    id: 13,
    title: "Reach out to the workspace community",
    category: "Outreach",
    format: "Outreach",
    status: "New",
  },
  {
    id: 14,
    title: "Suggest a guide for the partner newsletter",
    category: "Outreach",
    format: "Outreach",
    status: "New",
  },
  {
    id: 1,
    title: "Write a guide to organizing project feedback",
    category: "Content brief",
    format: "Article",
    status: "New",
  },
  {
    id: 2,
    title: "Explain how your workspace supports remote teams",
    category: "Content brief",
    format: "Article",
    status: "New",
  },
  {
    id: 3,
    title: "Publish a comparison of manual and automated reporting",
    category: "Content brief",
    format: "Article",
    status: "New",
  },
  {
    id: 4,
    title: "Create a checklist for client onboarding",
    category: "Content brief",
    format: "Checklist",
    status: "New",
  },
  {
    id: 10,
    title: "Create a practical guide to sharing project updates",
    category: "Content brief",
    format: "Article",
    status: "New",
  },
  {
    id: 5,
    title: "Add clear titles and descriptions to key pages",
    category: "Site improvements",
    format: "Website",
    status: "New",
  },
  {
    id: 6,
    title: "Share a practical tip from the help center",
    category: "Social updates",
    format: "Website",
    status: "New",
  },
  {
    id: 7,
    title: "Share your latest customer story with partners",
    category: "Outreach",
    format: "Outreach",
    status: "New",
  },
  {
    id: 8,
    title: "Update the product overview for new visitors",
    category: "Content brief",
    format: "Article",
    status: "In progress",
  },
  {
    id: 9,
    title: "Publish a frequently asked questions page",
    category: "Site improvements",
    format: "Website",
    status: "Done",
  },
];

const categories = [
  "Content brief",
  "Site improvements",
  "Social updates",
  "Outreach",
] as const;
const statuses: ActionStatus[] = ["New", "In progress", "Done", "Declined"];

export default function ActionsPage() {
  const [actions, setActions] = React.useState(initialActions);
  const [status, setStatus] = React.useState<ActionStatus | "All statuses">(
    "All statuses",
  );
  const [selectedCategories, setSelectedCategories] = React.useState<string[]>(
    [],
  );
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<number[]>([]);
  const [groupBy, setGroupBy] = React.useState<"category" | "format">(
    "category",
  );
  const visibleActions = actions.filter(
    (action) =>
      (status === "All statuses" || action.status === status) &&
      (!selectedCategories.length ||
        selectedCategories.includes(action.category)) &&
      action.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const actionable = visibleActions.filter((action) => action.status === "New");
  const siteCount = actions.filter(
    (action) =>
      action.category === "Site improvements" && action.status === "New",
  ).length;
  const progressCount = actions.filter(
    (action) => action.status === "In progress",
  ).length;
  const doneCount = actions.filter((action) => action.status === "Done").length;
  const filterCount =
    Number(status !== "All statuses") +
    Number(selectedCategories.length > 0) +
    Number(query.trim().length > 0);
  const hasFilters = filterCount > 0;
  function changeStatus(next: ActionStatus) {
    const ids = selected.length
      ? selected
      : actionable.map((action) => action.id);
    setActions((current) =>
      current.map((action) =>
        ids.includes(action.id) && action.status === "New"
          ? { ...action, status: next }
          : action,
      ),
    );
    setSelected([]);
  }
  return (
    <PageContainer
      title="Actions"
      spacing="canvas"
      toolbar={
        <>
          <FilterSelect
            label="Status"
            allLabel="All statuses"
            icon={<IconCircle className="ui-status-icon" />}
            value={status === "All statuses" ? null : status}
            options={statuses.map((value) => ({ value, label: value }))}
            onValueChange={(value) => { setStatus((value ?? "All statuses") as ActionStatus | "All statuses"); setSelected([]); }}
            reset={false}
          />
          <FilterMenu activeCount={filterCount}>
              <InputGroup variant="menu">
                <InputGroupAddon>
                  <IconSearch aria-hidden="true" />
                </InputGroupAddon>
                <InputGroupInput
                  aria-label="Search actions"
                  placeholder="Search actions"
                  value={query}
                  onClear={() => {
                    setQuery("");
                    setSelected([]);
                  }}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setSelected([]);
                  }}
                />
              </InputGroup>
              <DropdownMenuSeparator />
              <FilterSelectList
                mode="multiple"
                label="Categories"
                value={selectedCategories}
                options={categories.map((value) => ({ value, label: value }))}
                onValueChange={(next) => { setSelectedCategories(next); setSelected([]); }}
              />
          </FilterMenu>
          <FilterSelect
            label="Group by"
            placeholder="Group by: What to do"
            icon={<IconHierarchy aria-hidden="true" />}
            value={groupBy}
            defaultValue="category"
            options={[{ value: "category", label: "What to do" }, { value: "format", label: "Format" }]}
            onValueChange={(value) => setGroupBy(value === "format" ? "format" : "category")}
            reset={false}
          />
          {hasFilters && (
            <Button
              variant="reset"
              size="sm"
              onClick={() => {
                setStatus("All statuses");
                setSelectedCategories([]);
                setQuery("");
                setSelected([]);
              }}
            >
              Reset
            </Button>
          )}
          <Button
            size="sm"
            className="ml-auto"
            disabled={!actionable.length}
            onClick={() => changeStatus("In progress")}
          >
            <IconCheck aria-hidden="true" />
            {selected.length ? "Accept selected" : "Accept all"}
          </Button>
          {hasFilters && (
            <div className="flex w-full flex-wrap gap-2">
              {status !== "All statuses" && (
                <Badge
                  variant="filter"
                  label="Status"
                  removeLabel="Remove status filter"
                  onRemove={() => {
                    setStatus("All statuses");
                    setSelected([]);
                  }}
                >
                  {status}
                </Badge>
              )}
              {selectedCategories.map((category) => (
                <Badge
                  variant="filter"
                  label="Type"
                  removeLabel={`Remove ${category} filter`}
                  key={category}
                  onRemove={() => {
                    setSelectedCategories((current) =>
                      current.filter((item) => item !== category),
                    );
                    setSelected([]);
                  }}
                >
                  {category}
                </Badge>
              ))}
              {query && (
                <Badge
                  variant="filter"
                  label="Search"
                  removeLabel="Remove search filter"
                  onRemove={() => {
                    setQuery("");
                    setSelected([]);
                  }}
                >
                  {query}
                </Badge>
              )}
            </div>
          )}
        </>
      }
    >
      <div className="ui-page-intro">
        <h2 className="ui-page-title">Actions worth reviewing</h2>
        <p className="ui-page-description mt-1">
          Prioritized next steps across content, your website, and outreach.
        </p>
      </div>
      <SectionCards
        variant="band"
        metrics={[
          {
            label: "Site improvements",
            value: `${siteCount} ${siteCount === 1 ? "fix" : "fixes"} open`,
          },
          {
            label: "In progress",
            value: `${progressCount} action${progressCount === 1 ? "" : "s"} on your surfaces`,
          },
          {
            label: "Completed",
            value: `${doneCount} completed action${doneCount === 1 ? "" : "s"}`,
          },
        ]}
      />
      <div className="ui-grouped-list">
        {statuses.map((groupStatus) => {
          const groupActions = visibleActions.filter(
            (action) => action.status === groupStatus,
          );
          const groups =
            groupBy === "category"
              ? categories.filter((category) =>
                  groupActions.some((action) => action.category === category),
                )
              : [...new Set(groupActions.map((action) => action.format))];
          const StatusIcon =
            groupStatus === "Done"
              ? IconCircleCheckFilled
              : groupStatus === "Declined"
                ? IconCircleXFilled
                : groupStatus === "In progress"
                  ? IconCircleDot
                  : IconCircle;
          return (
            <Collapsible key={groupStatus} defaultOpen={groupStatus === "New"}>
              <CollapsibleTrigger>
                <CaretIcon />
                <StatusIcon
                  className="ui-status-icon"
                  data-status={groupStatus}
                  aria-hidden="true"
                />
                {groupStatus}
                <span className="type-ui-body text-muted-foreground">
                  {groupActions.length}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Accordion
                  key={groupBy}
                  variant="tree"
                  multiple
                  defaultValue={
                    groupStatus === "New"
                      ? [groupBy === "category" ? "Content brief" : "Article"]
                      : []
                  }
                >
                  {groups.map((group) => {
                    const items = groupActions.filter(
                      (action) => action[groupBy] === group,
                    );
                    const checked = items.every((action) =>
                      selected.includes(action.id),
                    );
                    return (
                      <AccordionItem key={group} value={group}>
                        <AccordionTrigger
                          selection={
                            groupStatus === "New" ? (
                              <Checkbox
                                aria-label={`Select all ${group} actions`}
                                checked={checked}
                                indeterminate={
                                  !checked &&
                                  items.some((action) =>
                                    selected.includes(action.id),
                                  )
                                }
                                onCheckedChange={(checked) =>
                                  setSelected((current) =>
                                    checked
                                      ? [
                                          ...new Set([
                                            ...current,
                                            ...items.map((action) => action.id),
                                          ]),
                                        ]
                                      : current.filter(
                                          (id) =>
                                            !items.some(
                                              (action) => action.id === id,
                                            ),
                                        ),
                                  )
                                }
                              />
                            ) : undefined
                          }
                        >
                          <span className="flex items-center gap-2">
                            {group}
                            <Badge variant="count">{items.length}</Badge>
                          </span>
                        </AccordionTrigger>
                        <AccordionContent>
                          <ul className="ui-tree-list">
                            {items.map((action) => (
                              <li key={action.id} className="ui-tree-row">
                                <span className="ui-tree-row-leading">
                                  <IconChartBar aria-hidden="true" />
                                  {action.status === "New" && (
                                    <span data-slot="row-selection">
                                      <Checkbox
                                        aria-label={`Select ${action.title}`}
                                        checked={selected.includes(action.id)}
                                        onCheckedChange={(checked) =>
                                          setSelected((current) =>
                                            checked
                                              ? [...current, action.id]
                                              : current.filter(
                                                  (id) => id !== action.id,
                                                ),
                                          )
                                        }
                                      />
                                    </span>
                                  )}
                                </span>
                                <span className="min-w-0 flex-1">
                                  {action.title}
                                </span>
                                <Badge variant="metadata">
                                  <IconNotes aria-hidden="true" />
                                  {action.format}
                                </Badge>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
                {groupActions.length === 0 && (
                  <p className="px-8 py-4 type-ui-body text-muted-foreground">
                    No {groupStatus.toLowerCase()} actions.
                  </p>
                )}
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
      <div className="ui-page-footer">
        <span>
          {selected.length
            ? `${selected.length} selected`
            : `${visibleActions.length} actions`}
        </span>
        <Button
          variant="ghost"
          size="sm"
          disabled={!actionable.length}
          onClick={() => changeStatus("Declined")}
        >
          <IconX aria-hidden="true" />
          {selected.length ? "Decline selected" : "Decline all"}
        </Button>
      </div>
    </PageContainer>
  );
}
