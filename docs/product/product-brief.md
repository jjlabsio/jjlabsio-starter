# Product Brief

## One-Liner

`create-jjlabs-app` is a CLI that scaffolds a production-oriented JJLabs starter project from a maintained template.

## Current Stage

Maintained starter CLI for quickly creating new SaaS-style projects.

## Target Users

- JJLabs maintainers creating or updating the starter template
- Developers starting a new project from the JJLabs stack
- AI agents working on scaffold, template, release, or documentation changes

## Problem

Starting a new product repeatedly requires the same baseline setup: app structure, auth, billing, database, email, UI packages, local ports, environment files, and development conventions.

## Promise

Generate a ready-to-customize monorepo that gives users a coherent starting point without copying stale setup steps by hand.

## Core Use Case

A user runs the CLI, chooses a layout, receives a generated project, fills in environment credentials, and starts development with `pnpm dev`.

## Current Scope

- Scaffold a pnpm workspace monorepo from `template/`
- Support sidebar and standard app layouts
- Remove unused layout files after selection
- Substitute project name and local development ports
- Create `.env` files from examples
- Install dependencies
- Provide generated-project setup documentation

## Out Of Scope

- Hosting or deploying generated projects automatically
- Managing user production infrastructure
- Acting as a generic framework-agnostic starter
- Keeping generated projects synchronized after creation

## Key Workflows

- CLI usage: `npx @jjlabsio/create-jjlabs-app@latest my-app`
- Template maintenance: update `template/`, scaffold steps, tests, and generated docs together
- Release: merge to `main` and let GitHub Actions publish the npm package

## Success Signals

- New projects scaffold without manual repair
- Generated docs match the generated code
- Template changes are covered by focused tests
- npm package excludes local env files and generated artifacts

## Differentiation

- Opinionated full-stack monorepo rather than a minimal app shell
- Scaffold-time cleanup of unused layouts
- Generated project guidance tailored to the included stack

## Constraints

- npm package includes `dist/` and `template/`
- Template dotfiles may need non-dotfile names before copy, such as `template/gitignore`
- Template source can contain route groups that only become buildable after scaffold cleanup

## Open Questions

- Whether future releases should include additional layout variants
- Whether generated docs should remain minimal or include optional planning templates
- Whether deployment guidance should stay vendor-light or include first-party examples

## Related Docs

- [Operations](../operations/index.md)
- [Development Guide](../operations/development.md)
