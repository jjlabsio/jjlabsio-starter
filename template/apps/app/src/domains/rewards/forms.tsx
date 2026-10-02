"use client";

import { useActionState, useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Checkbox } from "@repo/ui/components/checkbox";
import { Field, FieldLabel } from "@repo/ui/components/field";
import { submitReward, type RewardsResult } from "./actions";
import {
  PARTICIPATION_CONSENT,
  MARKETING_CONSENT,
  normalizePostUrl,
} from "@/lib/rewards-policy";

function Result({ state }: { state: RewardsResult }) {
  return (
    <>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm">
          {state.success}
        </p>
      )}
    </>
  );
}

export function SubmissionForm({ postUrl = "" }: { postUrl?: string }) {
  const [state, action, pending] = useActionState(submitReward, {});
  const [url, setUrl] = useState(postUrl);
  const [participation, setParticipation] = useState(false);
  let validUrl = false;
  try {
    normalizePostUrl(url);
    validUrl = true;
  } catch {
    /* Server and form share the same URL rules. */
  }
  return (
    <form action={action} className="space-y-6">
      <Field>
        <FieldLabel htmlFor="post-url">
          Public post URL{" "}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
        </FieldLabel>
        <Input
          id="post-url"
          name="postUrl"
          type="url"
          maxLength={2048}
          required
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="https://…"
        />
      </Field>
      <label className="flex items-start gap-3 type-ui-body leading-6">
        <Checkbox
          name="participation"
          value="on"
          required
          checked={participation}
          onCheckedChange={setParticipation}
          className="mt-1 shrink-0"
        />
        <span>
          {PARTICIPATION_CONSENT}{" "}
          <span aria-hidden="true" className="text-destructive">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </span>
      </label>
      <label className="flex items-start gap-3 type-ui-body leading-6">
        <Checkbox name="marketing" value="on" className="mt-1 shrink-0" />
        <span>
          {MARKETING_CONSENT}{" "}
          <span className="text-muted-foreground">(optional)</span>
        </span>
      </label>
      <Result state={state} />
      <Button type="submit" disabled={pending || !validUrl || !participation}>
        {pending ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
}
