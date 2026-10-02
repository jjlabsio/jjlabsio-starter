export const features = [
  {
    slug: "workflows",
    label: "Workflow automation",
    description: "Turn repeatable work into a reliable process.",
    detail:
      "Build a shared process for recurring tasks, keep ownership clear, and see what needs attention.",
    benefits: [
      "Organize repeatable tasks",
      "Keep ownership visible",
      "Review progress in one place",
    ],
  },
  {
    slug: "collaboration",
    label: "Team collaboration",
    description: "Bring people, decisions, and projects together.",
    detail:
      "Keep project context alongside your team's work, so everyone can follow decisions and pick up the next step.",
    benefits: [
      "Share project context",
      "Coordinate across teams",
      "Keep decisions connected to work",
    ],
  },
  {
    slug: "analytics",
    label: "Reporting & analytics",
    description: "Understand progress without another spreadsheet.",
    detail:
      "Review activity and project progress in a shared view, then use the results to decide what to do next.",
    benefits: [
      "Review project progress",
      "Spot work that needs attention",
      "Share a consistent view",
    ],
  },
] as const;

export const solutions = [
  {
    slug: "product-teams",
    label: "Product teams",
    description: "Plan, deliver, and learn in one workspace.",
    detail:
      "Connect planning, delivery, and reporting without losing the context behind your team's work.",
    benefits: ["Plan work together", "Follow delivery", "Review outcomes"],
  },
  {
    slug: "agencies",
    label: "Agencies",
    description: "Keep client projects organized and moving.",
    detail:
      "Give each client project a clear home, coordinate contributors, and make progress easier to communicate.",
    benefits: [
      "Organize client projects",
      "Coordinate contributors",
      "Prepare consistent reports",
    ],
  },
] as const;

export const marketingNavigation = [
  {
    label: "Features",
    groups: [
      {
        label: "Features",
        links: features
          .map((item) => ({
            label: item.label,
            description: item.description,
            href: `/features/${item.slug}`,
          })),
      },
    ],
  },
  {
    label: "Solutions",
    groups: [
      {
        label: "By team",
        links: solutions.map((item) => ({
          label: item.label,
          description: item.description,
          href: `/solutions/${item.slug}`,
        })),
      },
    ],
  },
  {
    label: "Resources",
    groups: [
      {
        label: "Resources",
        links: [
          { label: "Blog", description: "Ideas and practical guides for your team", href: "/blog" },
          { label: "Rewards Program", description: "Share your experience and get rewarded", href: "/rewards" },
        ],
      },
      // 실제 도구 구현 후 활성화. Tools는 최상위 메뉴가 아닌 Resources 그룹으로 유지.
      // { label: "Tools", links: [{ label: "Your tool", href: "/tools/your-tool" }] },
    ],
  },
] as const;
