"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  IconArrowUp,
  IconArrowDown,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Textarea } from "@repo/ui/components/textarea";
import { Field, FieldLabel, FieldDescription } from "@repo/ui/components/field";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Badge } from "@repo/ui/components/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@repo/ui/components/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@repo/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@repo/ui/components/dialog";
import { Tabs, TabsList, TabsTrigger } from "@repo/ui/components/tabs";
import {
  emptyEmail,
  type EmailBlock,
  type EmailContent,
} from "@repo/email/content";
import type { CampaignView, SendReview } from "@repo/email/campaigns";
import {
  previewEmail,
  saveEmail,
  reviewEmail,
  confirmEmail,
  sendEmailStep,
} from "./actions";

const blockNames: Record<EmailBlock["type"], string> = {
  heading: "Heading",
  paragraph: "Body text",
  bullets: "Bullet list",
  button: "Button",
  divider: "Divider",
};
const statuses = { DRAFT: "Draft", SENDING: "Sending", SENT: "Sent" };

export function EmailComposer({
  initial,
  recent,
}: {
  initial: CampaignView | null;
  recent: {
    id: string;
    subject: string;
    status: "DRAFT" | "SENDING" | "SENT";
  }[];
}) {
  const router = useRouter();
  const [content, setContent] = useState<EmailContent>(
    initial?.content ?? emptyEmail,
  );
  const [saved, setSaved] = useState<CampaignView | null>(initial);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ error?: string; success?: string }>(
    {},
  );
  const [html, setHtml] = useState("");
  const [previewError, setPreviewError] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [review, setReview] = useState<SendReview | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [serviceNotice, setServiceNotice] = useState(false);
  const [mobileTab, setMobileTab] = useState("compose");
  const requestVersion = useRef(0);
  const dirty =
    JSON.stringify(content) !== JSON.stringify(saved?.content ?? emptyEmail);
  const readOnly = !!saved && saved.status !== "DRAFT";

  useEffect(() => {
    const version = ++requestVersion.current;
    setPreviewLoading(true);
    const timer = setTimeout(async () => {
      try {
        const result = await previewEmail(content);
        if (version !== requestVersion.current) return;
        if (result.data) {
          setHtml(result.data.html);
          setPreviewError("");
        } else setPreviewError(result.error ?? "Could not load preview.");
      } catch {
        if (version === requestVersion.current)
          setPreviewError("Could not load preview. Try again.");
      } finally {
        if (version === requestVersion.current) setPreviewLoading(false);
      }
    }, 400);
    return () => {
      clearTimeout(timer);
      requestVersion.current += 1;
    };
  }, [content]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function patchBlock(index: number, next: EmailBlock) {
    setContent((value) => ({
      ...value,
      blocks: value.blocks.map((block, item) =>
        item === index ? next : block,
      ),
    }));
  }
  function moveBlock(index: number, offset: number) {
    setContent((value) => {
      const blocks = [...value.blocks];
      [blocks[index], blocks[index + offset]] = [
        blocks[index + offset]!,
        blocks[index]!,
      ];
      return { ...value, blocks };
    });
  }
  async function save() {
    setPending(true);
    setMessage({});
    try {
      const result = await saveEmail(content, saved?.id, saved?.revision);
      if (result.data) {
        setSaved(result.data);
        setContent(result.data.content);
        setMessage({ success: "Draft saved." });
        router.replace(`/emails?draft=${result.data.id}`, { scroll: false });
      } else setMessage({ error: result.error });
    } catch {
      setMessage({
        error: "Could not save the draft. Your changes are still here.",
      });
    } finally {
      setPending(false);
    }
  }
  async function openReview() {
    if (!saved) return;
    setPending(true);
    setMessage({});
    setServiceNotice(false);
    try {
      if (saved.status === "SENDING") {
        setReview(null);
        setConfirmOpen(true);
        return;
      }
      const result = await reviewEmail(saved.id, saved.revision);
      if (result.data) {
        setReview(result.data);
        setConfirmOpen(true);
      } else setMessage({ error: result.error });
    } catch {
      setMessage({ error: "Could not check recipients. Try again." });
    } finally {
      setPending(false);
    }
  }
  async function send() {
    if (!saved || (saved.status === "DRAFT" && (!review || !serviceNotice)))
      return;
    setPending(true);
    setMessage({});
    try {
      if (saved.status === "DRAFT" && review) {
        const result = await confirmEmail(
          saved.id,
          saved.revision,
          review.fingerprint,
          serviceNotice,
        );
        if (result.error) {
          setMessage({ error: result.error });
          return;
        }
        setSaved({ ...saved, status: "SENDING", recipientCount: review.count });
      }
      setConfirmOpen(false);
      // Bounded server actions keep progress durable without a long-running HTTP request.
      while (true) {
        const result = await sendEmailStep(saved.id);
        if (!result.data) {
          setMessage({ error: result.error });
          break;
        }
        setSaved(result.data);
        if (result.data.status === "SENT") {
          setMessage({
            success: `${result.data.acceptedCount} emails accepted by Resend.`,
          });
          break;
        }
      }
    } catch {
      setMessage({
        error:
          "Sending was interrupted. Reload this campaign and resume; do not create a duplicate.",
      });
      router.refresh();
    } finally {
      setPending(false);
      router.refresh();
    }
  }

  return (
    <section className="ui-form-frame">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 md:px-6">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <Select
            value={saved?.id ?? "new"}
            disabled={pending || dirty}
            onValueChange={(value) =>
              router.push(
                value === "new" ? "/emails" : `/emails?draft=${value}`,
              )
            }
          >
            <SelectTrigger aria-label="Open saved email" className="max-w-60">
              <SelectValue>
                {saved
                  ? saved.content.subject || "Untitled draft"
                  : "New email"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New email</SelectItem>
              {recent.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.subject || "Untitled draft"} · {statuses[item.status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="status">
            {saved ? statuses[saved.status] : "Draft"}
          </Badge>
        </div>
        <Button
          variant="outline"
          disabled={pending || dirty}
          onClick={() => router.push("/emails")}
        >
          New email
        </Button>
      </div>
      <Tabs
        value={mobileTab}
        onValueChange={(value) => setMobileTab(String(value))}
        className="shrink-0 border-b px-4 lg:hidden"
      >
        <TabsList variant="line">
          <TabsTrigger
            id="email-compose-tab"
            aria-controls="email-compose-panel"
            value="compose"
          >
            Compose
          </TabsTrigger>
          <TabsTrigger
            id="email-preview-tab"
            aria-controls="email-preview-panel"
            value="preview"
          >
            Preview
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <div className="ui-form-scroll">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-6 md:px-6 lg:grid-cols-2">
          <div
            id="email-compose-panel"
            role="tabpanel"
            aria-labelledby="email-compose-tab"
            className={
              mobileTab === "compose" ? "min-w-0" : "hidden min-w-0 lg:block"
            }
          >
            <fieldset
              disabled={pending || readOnly}
              className="grid min-w-0 gap-6"
            >
              <div className="ui-section-heading">
                <h2 className="type-ui-title-sm">Compose</h2>
                <p className="type-ui-body text-muted-foreground">
                  Write a service notice using reusable email blocks.
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email-subject">Subject *</FieldLabel>
                <Input
                  id="email-subject"
                  value={content.subject}
                  maxLength={200}
                  onChange={(event) =>
                    setContent({ ...content, subject: event.target.value })
                  }
                  placeholder="Your email subject"
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email-preheader">Preview text</FieldLabel>
                <FieldDescription>
                  A short summary shown next to the subject in the inbox.
                </FieldDescription>
                <Input
                  id="email-preheader"
                  value={content.previewText}
                  maxLength={250}
                  onChange={(event) =>
                    setContent({ ...content, previewText: event.target.value })
                  }
                  placeholder="Optional inbox preview"
                />
              </Field>
              <Field>
                <FieldLabel>Recipients *</FieldLabel>
                <div className="flex flex-wrap gap-5">
                  {(["trial", "subscribed"] as const).map((audience) => (
                    <label
                      key={audience}
                      className="flex items-center gap-2 type-ui-body"
                    >
                      <Checkbox
                        checked={content.audiences.includes(audience)}
                        onCheckedChange={(checked) =>
                          setContent({
                            ...content,
                            audiences: checked
                              ? [...content.audiences, audience]
                              : content.audiences.filter(
                                  (item) => item !== audience,
                                ),
                          })
                        }
                      />
                      {audience === "trial"
                        ? "Trial users"
                        : "Subscribed users"}
                    </label>
                  ))}
                </div>
                <FieldDescription>
                  Verified email accounts only. Expired trials are excluded.
                </FieldDescription>
              </Field>
              <div className="grid gap-5">
                {content.blocks.map((block, index) => (
                  <div key={index} className="min-w-0 space-y-3 border-b pb-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="type-ui-body-strong">
                        {blockNames[block.type]}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Move block ${index + 1} up`}
                          disabled={pending || readOnly || index === 0}
                          onClick={() => moveBlock(index, -1)}
                        >
                          <IconArrowUp />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Move block ${index + 1} down`}
                          disabled={
                            pending ||
                            readOnly ||
                            index === content.blocks.length - 1
                          }
                          onClick={() => moveBlock(index, 1)}
                        >
                          <IconArrowDown />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Remove block ${index + 1}`}
                          onClick={() =>
                            setContent({
                              ...content,
                              blocks: content.blocks.filter(
                                (_, item) => item !== index,
                              ),
                            })
                          }
                        >
                          <IconTrash />
                        </Button>
                      </div>
                    </div>
                    {block.type === "divider" ? (
                      <p className="type-ui-caption text-muted-foreground">
                        A horizontal line between content sections.
                      </p>
                    ) : (
                      <Field>
                        <FieldLabel
                          htmlFor={`email-block-${index}`}
                          className="sr-only"
                        >
                          {blockNames[block.type]} {index + 1}
                        </FieldLabel>
                        {block.type === "heading" || block.type === "button" ? (
                          <Input
                            id={`email-block-${index}`}
                            maxLength={block.type === "button" ? 100 : 200}
                            value={block.text}
                            placeholder={
                              block.type === "button"
                                ? "Button label"
                                : "Heading text"
                            }
                            onChange={(event) =>
                              patchBlock(index, {
                                ...block,
                                text: event.target.value,
                              })
                            }
                          />
                        ) : (
                          <Textarea
                            id={`email-block-${index}`}
                            rows={block.type === "bullets" ? 3 : 5}
                            maxLength={5000}
                            value={block.text}
                            placeholder={
                              block.type === "bullets"
                                ? "One bullet point per line"
                                : "Write your message"
                            }
                            onChange={(event) =>
                              patchBlock(index, {
                                ...block,
                                text: event.target.value,
                              })
                            }
                          />
                        )}
                        {block.type === "bullets" && (
                          <FieldDescription>
                            One bullet point per line.
                          </FieldDescription>
                        )}
                      </Field>
                    )}
                    {block.type === "button" && (
                      <Field>
                        <FieldLabel htmlFor={`email-url-${index}`}>
                          Button URL
                        </FieldLabel>
                        <Input
                          id={`email-url-${index}`}
                          type="url"
                          maxLength={2048}
                          value={block.url}
                          placeholder="https://…"
                          onChange={(event) =>
                            patchBlock(index, {
                              ...block,
                              url: event.target.value,
                            })
                          }
                        />
                      </Field>
                    )}
                  </div>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="outline"
                        disabled={
                          pending || readOnly || content.blocks.length >= 40
                        }
                      />
                    }
                  >
                    <IconPlus /> Add block
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {(Object.keys(blockNames) as EmailBlock["type"][]).map(
                      (type) => (
                        <DropdownMenuItem
                          key={type}
                          onClick={() =>
                            setContent({
                              ...content,
                              blocks: [
                                ...content.blocks,
                                type === "divider"
                                  ? { type }
                                  : type === "button"
                                    ? { type, text: "", url: "" }
                                    : { type, text: "" },
                              ],
                            })
                          }
                        >
                          {blockNames[type]}
                        </DropdownMenuItem>
                      ),
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </fieldset>
          </div>
          <div
            id="email-preview-panel"
            role="tabpanel"
            aria-labelledby="email-preview-tab"
            className={
              mobileTab === "preview"
                ? "min-w-0 space-y-4"
                : "hidden min-w-0 space-y-4 lg:block"
            }
          >
            <div className="ui-section-heading">
              <h2 className="type-ui-title-sm">Preview</h2>
              <p className="type-ui-body text-muted-foreground">
                The same layout used for delivery.
              </p>
            </div>
            {previewError && (
              <p role="alert" className="type-ui-body text-destructive">
                {previewError}
              </p>
            )}
            <div
              aria-busy={previewLoading}
              className="overflow-hidden rounded-lg border bg-white"
            >
              <iframe
                title="Email preview"
                srcDoc={html}
                sandbox=""
                className="h-[660px] w-full border-0"
              />
            </div>
            <p className="type-ui-caption text-muted-foreground" role="status">
              {previewLoading ? "Updating preview…" : "Preview is up to date."}
            </p>
          </div>
        </div>
      </div>
      <footer className="ui-page-footer flex-wrap py-2">
        <div className="min-w-0 flex-1 type-ui-body">
          {message.error ? (
            <p role="alert" className="text-destructive">
              {message.error}
            </p>
          ) : message.success ? (
            <p role="status">{message.success}</p>
          ) : (
            <p role="status">
              {saved?.status === "SENDING"
                ? `${saved.acceptedCount} / ${saved.recipientCount} accepted by Resend`
                : saved?.status === "SENT"
                  ? `${saved.acceptedCount} emails accepted by Resend`
                  : dirty
                    ? "Unsaved changes"
                    : saved
                      ? "Draft saved"
                      : "Save a draft before sending"}
            </p>
          )}
        </div>
        <div className="flex shrink-0 gap-2">
          {!readOnly && (
            <Button
              variant="outline"
              disabled={pending || (!dirty && !!saved)}
              onClick={save}
            >
              {pending ? "Working…" : "Save draft"}
            </Button>
          )}
          {saved?.status !== "SENT" && (
            <Button disabled={pending || !saved || dirty} onClick={openReview}>
              {saved?.status === "SENDING" ? "Resume sending" : "Review & send"}
            </Button>
          )}
        </div>
      </footer>
      <Dialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!pending) setConfirmOpen(open);
        }}
      >
        <DialogContent showCloseButton={!pending}>
          <DialogHeader>
            <DialogTitle>
              {saved?.status === "SENDING"
                ? "Resume sending?"
                : "Send this email?"}
            </DialogTitle>
            <DialogDescription>
              {review?.subject ?? saved?.content.subject}
            </DialogDescription>
          </DialogHeader>
          {review ? (
            <dl className="space-y-2 type-ui-body">
              <div className="flex justify-between">
                <dt>Trial users</dt>
                <dd>{review.trialCount}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Subscribed users</dt>
                <dd>{review.subscribedCount}</dd>
              </div>
              <div className="flex justify-between border-t pt-2 font-medium">
                <dt>Total recipients</dt>
                <dd>{review.count}</dd>
              </div>
            </dl>
          ) : (
            <p className="type-ui-body">
              {saved?.acceptedCount} of {saved?.recipientCount} already
              accepted. Only remaining batches will be processed.
            </p>
          )}
          {review && !review.configured && (
            <p className="type-ui-body text-muted-foreground">
              Configure Resend and a verified sender address in Admin to enable
              sending.
            </p>
          )}
          {review?.count === 0 && (
            <p className="type-ui-body text-muted-foreground">
              No eligible users in the selected audience.
            </p>
          )}
          {review && (
            <label className="flex items-start gap-2 type-ui-body">
              <Checkbox
                checked={serviceNotice}
                disabled={pending}
                onCheckedChange={(checked) =>
                  setServiceNotice(checked === true)
                }
              />
              <span>This is a service notice, not a promotional email. *</span>
            </label>
          )}
          {message.error && (
            <p role="alert" className="type-ui-body text-destructive">
              {message.error}
            </p>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              disabled={pending}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              disabled={
                pending ||
                (!!review &&
                  (!serviceNotice || !review.configured || !review.count))
              }
              onClick={send}
            >
              {pending
                ? "Sending…"
                : saved?.status === "SENDING"
                  ? "Resume sending"
                  : "Send email"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
