import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Enquiry, Product } from "../../../shared/types.js";

export function EnquiryForm({ product }: { product: Product }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "sending") return;
    const form = event.currentTarget;
    const fields = new FormData(form);
    const body: Enquiry = {
      productId: product.id,
      name: String(fields.get("name") || "").trim(),
      email: String(fields.get("email") || "").trim(),
      phone: String(fields.get("phone") || "").trim(),
      message: String(fields.get("message") || "").trim(),
    };
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok)
        throw new Error(
          response.status === 429
            ? "Too many attempts. Please wait a minute and try again."
            : "We could not send your enquiry. Please try again.",
        );
      setState("sent");
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Something went wrong.",
      );
      setState("idle");
    }
  }
  if (state === "sent")
    return (
      <div className="thank-you" role="status">
        <span aria-hidden="true">✓</span>
        <h2>Thank you for your enquiry.</h2>
        <p>We’ve passed your message to our sales team.</p>
        <Link to="/">Continue browsing →</Link>
      </div>
    );
  return (
    <form className="enquiry-form" onSubmit={submit}>
      <h2>Enquire about this product</h2>
      <p>Leave your contact details and our team will follow up.</p>
      <div className="form-row">
        <label>
          Name{" "}
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
          />
        </label>
        <label>
          Email{" "}
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
          />
        </label>
      </div>
      <label>
        Phone <span>(optional)</span>
        <input name="phone" type="tel" autoComplete="tel" maxLength={30} />
      </label>
      <label>
        Message <span>(optional)</span>
        <textarea
          name="message"
          rows={4}
          maxLength={2000}
          placeholder="Anything you'd like us to know?"
        />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button
        className="button dark"
        type="submit"
        disabled={state === "sending"}
      >
        {state === "sending" ? "Sending…" : "Send enquiry ↗"}
      </button>
    </form>
  );
}
