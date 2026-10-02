"use client";

import * as React from "react";
import {
  IconInfoCircleFilled,
  IconPlus,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { PageContainer } from "@/domains/sidebar/components/page-container";
import { Avatar, AvatarFallback } from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@repo/ui/components/field";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";

const initialProfile = {
  description:
    "Example Studio helps teams organize their projects, share knowledge, and deliver thoughtful work. One workspace for everyday collaboration.",
  industry: "Productivity Software",
  identity: ["practical", "thoughtful", "collaborative", "straightforward"],
  products: ["Project workspace", "Team knowledge base", "Shared planning"],
  personas: [] as string[],
};
const tagFields = [
  {
    key: "identity",
    label: "Brand identity",
    description: "Adjectives that describe your brand.",
    help: "Add a few words that describe the character of your brand.",
  },
  {
    key: "products",
    label: "Products & Services",
    description: "What your brand offers.",
    help: "List your main products or services.",
  },
  {
    key: "personas",
    label: "Personas",
    description: "Who your brand is for.",
    help: "List the people or teams your products are designed for.",
  },
] as const;
type TagKey = (typeof tagFields)[number]["key"];
const storageKey = "starter-profile-preview-v1";

export default function ProfilePage() {
  const [profile, setProfile] = React.useState(initialProfile);
  const [saved, setSaved] = React.useState(initialProfile);
  const [adding, setAdding] = React.useState<TagKey | null>(null);
  const [tag, setTag] = React.useState("");
  const [error, setError] = React.useState("");
  const [message, setMessage] = React.useState("");
  const dirty = JSON.stringify(profile) !== JSON.stringify(saved);

  React.useEffect(() => {
    try {
      const value = JSON.parse(sessionStorage.getItem(storageKey) ?? "null");
      if (
        value &&
        typeof value.description === "string" &&
        typeof value.industry === "string" &&
        tagFields.every(
          ({ key }) =>
            Array.isArray(value[key]) &&
            value[key].every((item: unknown) => typeof item === "string"),
        )
      ) {
        setProfile(value);
        setSaved(value);
      }
    } catch {
      setMessage(
        "Preview storage is unavailable. You can still edit this page.",
      );
    }
  }, []);

  function addTag(key: TagKey) {
    const value = tag.trim();
    if (!value) {
      setError("Enter a value to add.");
      return;
    }
    if (
      profile[key].some((item) => item.toLowerCase() === value.toLowerCase())
    ) {
      setError("This value is already in the list.");
      return;
    }
    setProfile({ ...profile, [key]: [...profile[key], value] });
    setAdding(null);
    setTag("");
    setError("");
    setMessage("");
  }

  function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!profile.description.trim() || !profile.industry.trim()) {
      setMessage("Description and industry cannot be empty.");
      return;
    }
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(profile));
      setSaved(profile);
      setMessage("Changes saved in this browser tab.");
    } catch {
      setMessage(
        "Could not save. Check your browser storage settings and try again.",
      );
    }
  }

  return (
    <PageContainer title="Profile" spacing="canvas">
      <form onSubmit={save} className="ui-form-frame">
        <div className="ui-form-scroll" data-testid="profile-scroll">
          <div className="ui-form-column" data-spacing="profile">
            <div className="ui-form-intro">
              <h2>Brand profile</h2>
              <p>
                Define your brand’s identity, audience, and positioning. Keep
                your team’s shared profile consistent across the workspace.
              </p>
            </div>
            <div className="ui-identity-summary" data-layout="standalone">
              <Avatar size="profile">
                <AvatarFallback>E</AvatarFallback>
              </Avatar>
              <h3>Example Studio</h3>
              <p>example.com</p>
            </div>
            <div className="ui-form-fields">
              <Field density="comfortable">
                <FieldLabel
                  htmlFor="profile-description"
                  help="A short, specific description of your brand."
                >
                  Description
                </FieldLabel>
                <FieldDescription id="description-help">
                  Context of your brand.
                </FieldDescription>
                <Textarea
                  id="profile-description"
                  aria-describedby="description-help"
                  value={profile.description}
                  required
                  maxLength={2000}
                  onChange={(event) => {
                    setProfile({ ...profile, description: event.target.value });
                    setMessage("");
                  }}
                />
              </Field>
              <Field density="comfortable">
                <FieldLabel
                  htmlFor="profile-industry"
                  help="Choose a specific industry rather than a broad category."
                >
                  Industry
                </FieldLabel>
                <FieldDescription id="industry-help">
                  The specific area your brand operates in.
                </FieldDescription>
                <Input
                  id="profile-industry"
                  aria-describedby="industry-help"
                  value={profile.industry}
                  required
                  maxLength={120}
                  onChange={(event) => {
                    setProfile({ ...profile, industry: event.target.value });
                    setMessage("");
                  }}
                />
              </Field>
              {tagFields.map(({ key, label, description, help }) => (
                <Field
                  key={key}
                  density="comfortable"
                  aria-labelledby={`${key}-label`}
                >
                  <FieldLabel id={`${key}-label`} help={help}>
                    {label}
                  </FieldLabel>
                  <FieldDescription>{description}</FieldDescription>
                  <div className="ui-tag-editor">
                    {profile[key].map((value) => (
                      <Badge
                        key={value}
                        variant="tag"
                        onRemove={() => {
                          setProfile({
                            ...profile,
                            [key]: profile[key].filter(
                              (item) => item !== value,
                            ),
                          });
                          setMessage("");
                        }}
                      >
                        {value}
                      </Badge>
                    ))}
                  </div>
                  {adding === key ? (
                    <div className="ui-tag-entry">
                      <Input
                        autoFocus
                        aria-label={`New ${label}`}
                        aria-invalid={!!error}
                        aria-describedby={error ? `${key}-error` : undefined}
                        value={tag}
                        maxLength={80}
                        onChange={(event) => {
                          setTag(event.target.value);
                          setError("");
                        }}
                        onKeyDown={(event) => {
                          if (
                            event.key === "Enter" &&
                            !event.nativeEvent.isComposing
                          ) {
                            event.preventDefault();
                            addTag(key);
                          }
                          if (event.key === "Escape") {
                            setAdding(null);
                            setError("");
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label={`Confirm ${label}`}
                        onClick={() => addTag(key)}
                      >
                        <IconCheck />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Cancel adding"
                        onClick={() => {
                          setAdding(null);
                          setError("");
                        }}
                      >
                        <IconX />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Button
                        type="button"
                        variant="dashed"
                        size="sm"
                        aria-label={`Add ${label}`}
                        onClick={() => {
                          setAdding(key);
                          setTag("");
                          setError("");
                        }}
                      >
                        Add <IconPlus />
                      </Button>
                    </div>
                  )}
                  {adding === key && error && (
                    <FieldError id={`${key}-error`}>{error}</FieldError>
                  )}
                </Field>
              ))}
            </div>
          </div>
        </div>
        <footer className="ui-form-save">
          <div>
            <p role="status" className="flex items-start gap-2">
              <IconInfoCircleFilled
                className="mt-0.5 size-3.5 shrink-0"
                aria-hidden="true"
              />
              {message ||
                "Preview data stays in this browser tab. No server connection."}
            </p>
            <Button type="submit" disabled={!dirty || adding !== null}>
              Save changes
            </Button>
          </div>
        </footer>
      </form>
    </PageContainer>
  );
}
