// Fixed demo records; replace with authorized server queries in a service.
export const exampleProjects = [
  {
    id: "atlas",
    name: "Atlas",
    description: "Customer onboarding and product documentation.",
    owner: "Product team",
    status: "Active",
  },
  {
    id: "orbit",
    name: "Orbit",
    description: "Launch resources and campaign pages.",
    owner: "Marketing team",
    status: "Draft",
  },
];
export const examplePages = [
  {
    id: "getting-started",
    projectId: "atlas",
    name: "Getting started",
    path: "/guides/getting-started",
    status: "Published",
    views: 1240,
    updated: "2026.09.28",
    content:
      "Create your workspace, invite your team, and publish your first page. This guide helps new customers complete their initial setup.",
  },
  {
    id: "team-access",
    projectId: "atlas",
    name: "Team access",
    path: "/guides/team-access",
    status: "Draft",
    views: 320,
    updated: "2026.09.27",
    content:
      "Manage members and assign the access each team needs. Review permissions before inviting collaborators.",
  },
  {
    id: "launch",
    projectId: "orbit",
    name: "Launch checklist",
    path: "/launch",
    status: "Published",
    views: 860,
    updated: "2026.09.26",
    content:
      "Prepare launch assets, review the campaign, and confirm your release checklist.",
  },
];
