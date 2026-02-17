"use client";

import * as React from "react";
import {
  IconBold,
  IconItalic,
  IconUnderline,
  IconAlignLeft,
  IconAlignCenter,
  IconAlignRight,
  IconUpload,
  IconPlus,
  IconMail,
  IconLoader2,
  IconDotsVertical,
  IconPencil,
  IconCopy,
  IconTrash,
  IconArchive,
  IconUser,
  IconSettings,
  IconLogout,
  IconBell,
  IconStar,
} from "@tabler/icons-react";

import { PageContainer } from "@/components/page-container";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Input } from "@repo/ui/components/input";
import { Separator } from "@repo/ui/components/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { Toggle } from "@repo/ui/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import { Skeleton } from "@repo/ui/components/skeleton";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-wrap items-start gap-3">{children}</div>
    </div>
  );
}

export default function ComponentsPage() {
  const [selectValue, setSelectValue] = React.useState<string | null>(null);

  return (
    <PageContainer title="Components">
      <div className="space-y-10">
        {/* Button */}
        <Section title="Button">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Separator orientation="vertical" className="h-8" />
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Separator orientation="vertical" className="h-8" />
          <Button>
            <IconMail data-icon="inline-start" />
            With Icon
          </Button>
          <Button>
            Upload
            <IconUpload data-icon="inline-end" />
          </Button>
          <Button size="icon">
            <IconPlus />
          </Button>
          <Button disabled>
            <IconLoader2 className="animate-spin" />
            Loading
          </Button>
        </Section>

        <Separator />

        {/* Badge */}
        <Section title="Badge">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="ghost">Ghost</Badge>
        </Section>

        <Separator />

        {/* Input */}
        <Section title="Input">
          <Input placeholder="Default input" className="max-w-xs" />
          <Input type="email" placeholder="Email" className="max-w-xs" />
          <Input type="password" placeholder="Password" className="max-w-xs" />
          <Input disabled placeholder="Disabled" className="max-w-xs" />
        </Section>

        <Separator />

        {/* Select */}
        <Section title="Select">
          <Select value={selectValue} onValueChange={(v) => setSelectValue(v)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select a fruit" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="cherry">Cherry</SelectItem>
              <SelectItem value="grape">Grape</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectValue} onValueChange={(v) => setSelectValue(v)}>
            <SelectTrigger className="w-48" size="sm">
              <SelectValue placeholder="Small select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="banana">Banana</SelectItem>
              <SelectItem value="cherry">Cherry</SelectItem>
            </SelectContent>
          </Select>
        </Section>

        <Separator />

        {/* Dropdown Menu */}
        <Section title="Dropdown Menu">
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              Open Menu
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuGroup>
                <DropdownMenuItem>
                  <IconPencil />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconCopy />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <IconArchive />
                  Archive
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <IconBell />
                  Notifications
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem>Email</DropdownMenuItem>
                  <DropdownMenuItem>Push</DropdownMenuItem>
                  <DropdownMenuItem>SMS</DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive">
                <IconTrash />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" size="icon" />}
            >
              <IconDotsVertical />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <IconUser />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconSettings />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <IconLogout />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Section>

        <Separator />

        {/* Avatar */}
        <Section title="Avatar">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Avatar className="h-12 w-12">
            <AvatarFallback className="text-lg">JJ</AvatarFallback>
          </Avatar>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">AB</AvatarFallback>
          </Avatar>
          <div className="flex -space-x-2">
            <Avatar className="border-2 border-background">
              <AvatarFallback>A</AvatarFallback>
            </Avatar>
            <Avatar className="border-2 border-background">
              <AvatarFallback>B</AvatarFallback>
            </Avatar>
            <Avatar className="border-2 border-background">
              <AvatarFallback>C</AvatarFallback>
            </Avatar>
          </div>
        </Section>

        <Separator />

        {/* Tooltip */}
        <Section title="Tooltip">
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" />}>
              Hover me
            </TooltipTrigger>
            <TooltipContent>This is a tooltip</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger render={<Button variant="outline" size="icon" />}>
              <IconStar />
            </TooltipTrigger>
            <TooltipContent side="bottom">Star this item</TooltipContent>
          </Tooltip>
        </Section>

        <Separator />

        {/* Toggle & Toggle Group */}
        <Section title="Toggle & Toggle Group">
          <Toggle aria-label="Toggle bold">
            <IconBold />
          </Toggle>
          <Toggle variant="outline" aria-label="Toggle italic">
            <IconItalic />
          </Toggle>
          <Separator orientation="vertical" className="h-8" />
          <ToggleGroup>
            <ToggleGroupItem value="bold" aria-label="Bold">
              <IconBold />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Italic">
              <IconItalic />
            </ToggleGroupItem>
            <ToggleGroupItem value="underline" aria-label="Underline">
              <IconUnderline />
            </ToggleGroupItem>
          </ToggleGroup>
          <Separator orientation="vertical" className="h-8" />
          <ToggleGroup variant="outline">
            <ToggleGroupItem value="left" aria-label="Align left">
              <IconAlignLeft />
            </ToggleGroupItem>
            <ToggleGroupItem value="center" aria-label="Align center">
              <IconAlignCenter />
            </ToggleGroupItem>
            <ToggleGroupItem value="right" aria-label="Align right">
              <IconAlignRight />
            </ToggleGroupItem>
          </ToggleGroup>
        </Section>

        <Separator />

        {/* Card */}
        <Section title="Card">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Card Title</CardTitle>
              <CardDescription>
                A description of the card content goes here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Input placeholder="Name" />
                <Input placeholder="Email" type="email" />
              </div>
            </CardContent>
            <CardFooter className="justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button>Submit</Button>
            </CardFooter>
          </Card>
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>You have 3 unread messages.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Alice", message: "Hey, how are you?" },
                { name: "Bob", message: "Meeting at 3pm" },
                { name: "Carol", message: "PR review requested" },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {item.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-0.5">
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.message}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </Section>

        <Separator />

        {/* Skeleton */}
        <Section title="Skeleton">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Card className="w-full max-w-xs">
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </Section>
      </div>
    </PageContainer>
  );
}
