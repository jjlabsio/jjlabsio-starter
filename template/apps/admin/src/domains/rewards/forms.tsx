"use client";
import { useActionState, startTransition } from "react";
import { Button } from "@repo/ui/components/button";
import { Textarea } from "@repo/ui/components/textarea";
import { Field, FieldLabel } from "@repo/ui/components/field";
import { reviewReward, type RewardsResult } from "./actions";
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

export function ReviewForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(reviewReward, {});
  return (
    <form
      action={action}
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const submitter = (event.nativeEvent as SubmitEvent)
          .submitter as HTMLButtonElement | null;
        const form = new FormData(event.currentTarget);
        // Capture the chosen action before pending disables the submitter.
        form.set("status", submitter?.value ?? "");
        startTransition(() => action(form));
      }}
    >
      <input type="hidden" name="id" value={id} />
      <Field>
        <FieldLabel htmlFor={`note-${id}`}>Message to the user</FieldLabel>
        <Textarea
          id={`note-${id}`}
          name="note"
          maxLength={1000}
          placeholder="Required for a change request or rejection"
        />
      </Field>
      <Result state={state} />
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="status" value="APPROVED" disabled={pending}>
          Approve
        </Button>
        <Button
          type="submit"
          name="status"
          value="CHANGES_REQUESTED"
          variant="outline"
          disabled={pending}
        >
          Request changes
        </Button>
        <Button
          type="submit"
          name="status"
          value="REJECTED"
          variant="outline"
          disabled={pending}
        >
          Reject
        </Button>
      </div>
    </form>
  );
}
