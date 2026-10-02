"use client";

import * as React from "react";
import { SiteHeader } from "@/domains/sidebar/components/site-header";
import type { BreadcrumbEntry } from "../lib/navigation";

interface PageContainerProps {
  title: string;
  breadcrumbs?: BreadcrumbEntry[];
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  stickySummary?: React.ReactNode;
  summaryTargetId?: string;
  spacing?:
    | "default"
    | "dashboard"
    | "canvas"
    | "settings"
    | "settings-sections";
  children: React.ReactNode;
}

export function PageContainer({
  title,
  breadcrumbs,
  actions,
  toolbar,
  stickySummary,
  summaryTargetId,
  spacing = "default",
  children,
}: PageContainerProps) {
  const toolbarRef = React.useRef<HTMLDivElement>(null);
  const [showSummary, setShowSummary] = React.useState(false);
  const [toolbarHeight, setToolbarHeight] = React.useState(0);
  const hasSummary = Boolean(stickySummary);
  const hasToolbar = Boolean(toolbar);

  React.useLayoutEffect(() => {
    const element = toolbarRef.current;
    if (!element) {
      setToolbarHeight(0);
      return;
    }
    const measure = () =>
      setToolbarHeight(element.getBoundingClientRect().height);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasToolbar]);

  React.useEffect(() => {
    if (!hasSummary || !summaryTargetId) return;
    const update = () => {
      const target = document.getElementById(summaryTargetId);
      if (!target) return;
      const threshold = toolbarRef.current?.getBoundingClientRect().bottom ?? 0;
      setShowSummary(target.getBoundingClientRect().bottom <= threshold);
    };
    update();
    document.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      document.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [hasSummary, summaryTargetId]);

  return (
    <>
      <SiteHeader title={title} breadcrumbs={breadcrumbs} actions={actions} />
      {(toolbar || stickySummary) && (
        <div className="sticky top-[var(--header-height)] z-10 bg-background">
          {toolbar && (
            <div ref={toolbarRef} className="ui-filter-bar px-4">
              {toolbar}
            </div>
          )}
          {stickySummary && showSummary && stickySummary}
        </div>
      )}
      <div
        className="flex flex-1 flex-col"
        style={
          {
            "--page-content-height": `calc(100dvh - var(--header-height) - ${toolbarHeight}px)`,
          } as React.CSSProperties
        }
      >
        <div className="@container/main ui-page-layout" data-layout={spacing}>
          {children}
        </div>
      </div>
    </>
  );
}
