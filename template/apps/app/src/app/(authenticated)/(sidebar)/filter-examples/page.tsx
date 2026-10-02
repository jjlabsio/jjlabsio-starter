"use client";

import * as React from "react";
import Link from "next/link";
import { IconDots, IconWorld, IconCircle } from "@tabler/icons-react";
import { TIERS } from "@repo/billing/plan-config";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import {
  HeaderSubscriptionProvider,
  SiteHeader,
  useHeaderSubscription,
} from "@/domains/sidebar/components/site-header";
import {
  FilterSelect,
  FilterSelectList,
  FilterMenu,
  type FilterSelectOption,
} from "@repo/ui/components/filter-select";
import {
  DateRangePicker,
  ComparisonDateRangePicker,
} from "@repo/ui/components/date-range-picker";
import type {
  DateRangeValue,
  DateRangeComparison,
} from "@repo/ui/lib/date-range";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@repo/ui/components/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@repo/ui/components/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@repo/ui/components/dialog";
import { Field, FieldLabel, FieldError } from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";

const options: FilterSelectOption[] = [
  { value: "web", label: "Web", group: "Channels" },
  { value: "mobile", label: "Mobile", group: "Channels" },
  { value: "email", label: "Email", group: "Channels" },
  {
    value: "coming-soon",
    label: "Coming soon",
    group: "Channels",
    disabled: true,
  },
];
const statuses = [
  { value: "active", label: "Active" },
  { value: "archived", label: "Archived" },
];
const headings = ["기본 상태", "1개 선택", "2개 선택"];
const presets = [
  {
    label: "All time",
    range: { from: new Date(2026, 8, 1), to: new Date(2026, 8, 28) },
  },
  {
    label: "Last 7 days",
    range: { from: new Date(2026, 8, 22), to: new Date(2026, 8, 28) },
  },
  {
    label: "Last 14 days",
    range: { from: new Date(2026, 8, 15), to: new Date(2026, 8, 28) },
  },
];

function Panel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card variant="panel">
      <CardHeader>
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 py-4 lg:grid-cols-3">
        {children}
      </CardContent>
    </Card>
  );
}

function FilterExample({
  index,
  summary = "value",
  multiple = false,
  create = false,
}: {
  index: number;
  summary?: "value" | "compact" | "chips";
  multiple?: boolean;
  create?: boolean;
}) {
  const [single, setSingle] = React.useState<string | null>(
    index ? "web" : null,
  );
  const defaultValues =
    multiple && summary === "value"
      ? options
          .filter((option) => !option.disabled)
          .map((option) => option.value)
      : [];
  const [many, setMany] = React.useState<string[]>(
    index === 0
      ? defaultValues
      : options.slice(0, index).map((option) => option.value),
  );
  const [items, setItems] = React.useState(options);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [error, setError] = React.useState("");
  const returnFocus = React.useRef<HTMLButtonElement | null>(null);
  const id = React.useId();
  const common = {
    label: "Channel",
    allLabel: "All channels",
    options: items,
    searchable: true,
    summary,
    ariaLabel: `${multiple ? summary : "single"} ${headings[index]}`,
    onCreate: create
      ? {
          label: "Add channel",
          onClick: (trigger: HTMLButtonElement | null) => {
            returnFocus.current = trigger;
            setName("");
            setError("");
            setOpen(true);
          },
        }
      : undefined,
  };
  return (
    <section
      className="flex min-w-0 flex-col gap-3"
      data-example={`${multiple ? summary : "single"}-${index}`}
    >
      <h3 className="type-ui-caption text-muted-foreground">
        {multiple
          ? index === 0 && summary === "value"
            ? "전체 선택 · 기본 상태"
            : headings[index]
          : index === 2
            ? "비활성 상태"
            : index
              ? "선택된 상태"
              : "기본 상태"}
      </h3>
      {multiple ? (
        <FilterSelect
          {...common}
          mode="multiple"
          value={many}
          defaultValue={defaultValues}
          onValueChange={setMany}
        />
      ) : (
        <FilterSelect
          {...common}
          value={single}
          onValueChange={setSingle}
          disabled={index === 2}
        />
      )}
      <p className="type-ui-caption text-muted-foreground">
        {index === 2 && !multiple
          ? "비활성 컨트롤"
          : create
            ? "검색·빈 결과·항목 추가"
            : summary === "compact"
              ? "테이블: 분류명과 개수 유지"
              : summary === "chips"
                ? "선택값을 바깥 칩으로 표시"
                : "단일 값 또는 복수 개수 표시"}
      </p>
      {create && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent variant="form" finalFocus={returnFocus}>
            <DialogHeader>
              <DialogTitle>Add channel</DialogTitle>
              <DialogDescription>
                이 검수 페이지의 예시 목록에만 추가합니다.
              </DialogDescription>
            </DialogHeader>
            <form
              id={id}
              onSubmit={(event) => {
                event.preventDefault();
                const label = name.trim();
                if (!label) {
                  setError("이름을 입력하세요.");
                  return;
                }
                if (
                  items.some(
                    (item) =>
                      item.label.toLocaleLowerCase() ===
                      label.toLocaleLowerCase(),
                  )
                ) {
                  setError("이미 있는 이름입니다.");
                  return;
                }
                const value = `example-${items.length}`;
                setItems((current) => [
                  ...current,
                  { value, label, group: "Channels" },
                ]);
                if (multiple) setMany((current) => [...current, value]);
                else setSingle(value);
                setOpen(false);
              }}
            >
              <Field density="compact" data-invalid={!!error}>
                <FieldLabel htmlFor={`${id}-name`}>Name</FieldLabel>
                <Input
                  id={`${id}-name`}
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value);
                    setError("");
                  }}
                  aria-invalid={!!error}
                />
                {error && <FieldError>{error}</FieldError>}
              </Field>
            </form>
            <DialogFooter variant="form">
              <DialogClose render={<Button variant="outline" />}>
                Cancel
              </DialogClose>
              <Button type="submit" form={id}>
                Add channel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  );
}

function DateExample({
  index,
  compare = false,
}: {
  index: number;
  compare?: boolean;
}) {
  const [range, setRange] = React.useState<DateRangeValue>(
    index === 2
      ? { from: new Date(2026, 8, 10), to: new Date(2026, 8, 14) }
      : presets[index]!.range,
  );
  const [comparison, setComparison] =
    React.useState<DateRangeComparison>("previous-period");
  const pickerProps = {
    value: range,
    onValueChange: setRange,
    presets,
    minDate: presets[0]!.range.from,
    maxDate: presets[0]!.range.to,
  };
  return (
    <section
      className="flex min-w-0 flex-col gap-3"
      data-example={`${compare ? "comparison-date" : "date"}-${index}`}
    >
      <h3 className="type-ui-caption text-muted-foreground">
        {["전체 기간", "프리셋 선택", "사용자 지정 기간"][index]}
      </h3>
      <div>
        {compare ? (
          <ComparisonDateRangePicker
            {...pickerProps}
            comparison={comparison}
            onComparisonChange={setComparison}
          />
        ) : (
          <DateRangePicker {...pickerProps} />
        )}
      </div>
      <p className="type-ui-caption text-muted-foreground">
        {compare
          ? "조회 기간·비교 기준·비교 기간 요약"
          : "프리셋·달력·선택 기간 요약"}
      </p>
    </section>
  );
}

function FilterGroupExample({ selected }: { selected: boolean }) {
  const [channels, setChannels] = React.useState<string[]>(
    selected ? ["web", "mobile"] : [],
  );
  const [status, setStatus] = React.useState<string | null>(
    selected ? "active" : null,
  );
  return (
    <section
      className="flex min-w-0 flex-col gap-3"
      data-example={`group-${selected ? "selected" : "default"}`}
    >
      <h3 className="type-ui-caption text-muted-foreground">
        {selected ? "2개 분류 적용" : "기본 상태"}
      </h3>
      <div>
        <FilterMenu
          activeCount={Number(channels.length > 0) + Number(status !== null)}
          onReset={() => {
            setChannels([]);
            setStatus(null);
          }}
        >
          <DropdownMenuGroup>
            <DropdownMenuLabel>Filter by</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconWorld />
              Channels
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent variant="filter">
              <FilterSelectList
                mode="multiple"
                label="Channels"
                value={channels}
                onValueChange={setChannels}
                options={options}
                searchable
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <IconCircle />
              Status
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent variant="filter">
              <FilterSelectList
                label="Status"
                allLabel="All statuses"
                value={status}
                onValueChange={setStatus}
                options={statuses}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </FilterMenu>
      </div>
      <p className="type-ui-caption text-muted-foreground">
        하위 메뉴도 같은 선택 목록 사용
      </p>
    </section>
  );
}

function CommandExample({ icon = false }: { icon?: boolean }) {
  const [last, setLast] = React.useState("아직 실행하지 않음");
  return (
    <section
      className="flex min-w-0 flex-col gap-3"
      data-example={icon ? "row-menu" : "command-menu"}
    >
      <h3 className="type-ui-caption text-muted-foreground">
        {icon ? "행 더보기" : "명령·페이지 이동"}
      </h3>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant={icon ? "ghost" : "outline"}
                size={icon ? "icon-sm" : "sm"}
                aria-label={icon ? "Example row actions" : "Example commands"}
              />
            }
          >
            {icon ? <IconDots /> : "Actions"}
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setLast("View details 실행됨")}>
              View details
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/settings/profile" />}>
              Open profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setLast("Archive 실행됨")}>
              Archive example
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p role="status" className="type-ui-caption text-muted-foreground">
        {last}
      </p>
    </section>
  );
}

function FormExample({ selected }: { selected: boolean }) {
  const [value, setValue] = React.useState<string | null>(
    selected ? "active" : null,
  );
  const id = React.useId();
  return (
    <section
      className="flex min-w-0 flex-col gap-3"
      data-example={`form-${selected ? "selected" : "default"}`}
    >
      <h3 className="type-ui-caption text-muted-foreground">
        {selected ? "입력된 상태" : "미입력 상태"}
      </h3>
      <Field density="compact">
        <FieldLabel htmlFor={id}>Status</FieldLabel>
        <Select items={statuses} value={value} onValueChange={setValue}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue placeholder="Choose status" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {statuses.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </Field>
      <p className="type-ui-caption text-muted-foreground">
        필터가 아닌 폼 입력 · 같은 팝업과 행 규칙
      </p>
    </section>
  );
}

export default function FilterExamplesPage() {
  const [revision, setRevision] = React.useState(0);
  const billing = useHeaderSubscription();
  const [previewCheckedAt] = React.useState(billing?.now ?? 0);
  return (
    <PageContainer
      title="Filters & menus"
      actions={
        <Button
          variant="outline"
          size="sm"
          onClick={() => setRevision((current) => current + 1)}
        >
          예시 상태 복원
        </Button>
      }
    >
      <div key={revision} className="ui-section-stack">
        <Card
          variant="panel"
          id="subscription-header-examples"
          className="scroll-mt-(--header-height)"
        >
          <CardHeader>
            <CardTitle>
              <h2>상단 구독 상태</h2>
            </CardTitle>
            <CardDescription>
              실제 상단바의 체험·Starter·Pro·Premium 예시입니다. 체험은 요금제,
              유료 요금제는 구독 관리로 이동합니다. 실제 계정 상태는 바꾸지
              않습니다.
            </CardDescription>
          </CardHeader>
          <CardContent padding="none">
            <HeaderSubscriptionProvider
              subscription={{
                status: "TRIALING",
                trialEnd: new Date(previewCheckedAt + 14 * 86_400_000),
              }}
              checkedAt={previewCheckedAt}
            >
              <SiteHeader title="체험 중" titleAs="h3" />
            </HeaderSubscriptionProvider>
            <HeaderSubscriptionProvider
              subscription={{
                status: "TRIALING",
                trialEnd: new Date(previewCheckedAt + 2 * 86_400_000),
              }}
              checkedAt={previewCheckedAt}
            >
              <SiteHeader title="체험 종료 임박" titleAs="h3" />
            </HeaderSubscriptionProvider>
            {TIERS.map((tier) => (
              <HeaderSubscriptionProvider
                key={tier.id}
                subscription={{ status: "ACTIVE", trialEnd: null }}
                planName={tier.name}
                checkedAt={previewCheckedAt}
              >
                <SiteHeader title={`${tier.name} 이용 중`} titleAs="h3" />
              </HeaderSubscriptionProvider>
            ))}
          </CardContent>
        </Card>
        <Panel
          title="단일 선택"
          description="Actions 상태·그룹, Requests 카테고리, Projects 선택"
        >
          <FilterExample index={0} create />
          <FilterExample index={1} create />
          <FilterExample index={2} />
        </Panel>
        <Panel
          title="복수 선택 · 값 표시"
          description="Overview 소스: 1개는 값, 2개 이상은 개수"
        >
          <FilterExample index={0} multiple />
          <FilterExample index={1} multiple />
          <FilterExample index={2} multiple />
        </Panel>
        <Panel
          title="복수 선택 · compact"
          description="테이블 도구막대: 분류명·개수 배지, 높이 유지"
        >
          <FilterExample index={0} multiple summary="compact" />
          <FilterExample index={1} multiple summary="compact" />
          <FilterExample index={2} multiple summary="compact" />
        </Panel>
        <Panel
          title="복수 선택 · chips"
          description="선택값 행을 둘 수 있는 영역: 칩 삭제와 외부 초기화"
        >
          <FilterExample index={0} multiple summary="chips" />
          <FilterExample index={1} multiple summary="chips" />
          <FilterExample index={2} multiple summary="chips" />
        </Panel>
        <Panel
          title="날짜 범위 · DateRangePicker"
          description="기간 선택만 제공 · Overview·Requests에서 사용"
        >
          <DateExample index={0} />
          <DateExample index={1} />
          <DateExample index={2} />
        </Panel>
        <Panel
          title="기간 비교 · ComparisonDateRangePicker"
          description="조회 기간과 비교 기준 선택"
        >
          <DateExample index={0} compare />
          <DateExample index={1} compare />
          <DateExample index={2} compare />
        </Panel>
        <Panel
          title="필터 분류·하위 메뉴"
          description="공통 FilterMenu와 FilterSelectList 조합"
        >
          <FilterGroupExample selected={false} />
          <FilterGroupExample selected />
        </Panel>
        <Panel title="명령 메뉴" description="계정·행 더보기: 값 선택과 구분">
          <CommandExample />
          <CommandExample icon />
        </Panel>
        <Panel
          title="폼 선택"
          description="Requests 생성 폼: OS 기본 목록 대신 공통 Select"
        >
          <FormExample selected={false} />
          <FormExample selected />
        </Panel>
      </div>
    </PageContainer>
  );
}
