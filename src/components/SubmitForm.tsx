"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import type { Category, CategoryGroup, City } from "@/lib/types";

type Props = {
  categories: Category[];
  categoryGroups: readonly CategoryGroup[];
  cities: City[];
};

type Result =
  | { kind: "success"; listingId: string; pendingReview: boolean }
  | { kind: "duplicate"; existingListingId: string; existingTitle: string }
  | { kind: "error"; message: string };

const MAX_TITLE = 80;
const MAX_DESCRIPTION = 300;

export default function SubmitForm({ categories, categoryGroups, cities }: Props) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [board, setBoard] = useState<"national" | "city">("national");
  const [cityId, setCityId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const errors: Record<string, string> = {};
  if (!url.trim()) errors.url = "URL is required.";
  else if (!/^https?:\/\/.+\..+/.test(url.trim())) errors.url = "Enter a full URL, starting with https://";
  if (!title.trim()) errors.title = "Title is required.";
  else if (title.length > MAX_TITLE) errors.title = `Keep it under ${MAX_TITLE} characters.`;
  if (!description.trim()) errors.description = "A short description helps people know what this is.";
  else if (description.length > MAX_DESCRIPTION) errors.description = `Keep it under ${MAX_DESCRIPTION} characters.`;
  if (!categoryId) errors.category = "Pick a category.";
  if (board === "city" && !cityId) errors.city = "Pick a city.";
  const cleanPhone = phone.replace(/\D/g, "").slice(-10);
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) errors.phone = "Enter a valid 10-digit mobile number.";

  const isValid = Object.keys(errors).length === 0;

  function markTouched(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function onScreenshotChange(file: File | null) {
    setScreenshot(file);
    if (screenshotPreview) URL.revokeObjectURL(screenshotPreview);
    setScreenshotPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ url: true, title: true, description: true, category: true, city: true, phone: true });
    if (!isValid) return;

    setSubmitting(true);
    setResult(null);
    try {
      const form = new FormData();
      form.set("url", url.trim());
      form.set("title", title.trim());
      form.set("description", description.trim());
      form.set("categoryId", categoryId!);
      form.set("cityId", board === "city" ? cityId! : "");
      form.set("phone", cleanPhone);
      if (screenshot) form.set("screenshot", screenshot);

      const res = await fetch("/api/listings", { method: "POST", body: form });
      const data = await res.json();

      if (res.ok) {
        setResult({ kind: "success", listingId: data.listingId, pendingReview: data.pendingReview });
      } else if (res.status === 409) {
        setResult({ kind: "duplicate", existingListingId: data.existingListingId, existingTitle: data.error });
      } else {
        setResult({ kind: "error", message: data.error ?? "Something went wrong. Please try again." });
      }
    } catch {
      setResult({ kind: "error", message: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (result?.kind === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-3xl border border-india-green/40 bg-india-green/10 p-8 text-center">
        <span className="text-3xl">{result.pendingReview ? "🕓" : "🎉"}</span>
        <h2 className="text-lg font-bold text-foreground">
          {result.pendingReview ? "Submitted for review" : "You're live!"}
        </h2>
        <p className="text-sm text-foreground/80">
          {result.pendingReview
            ? "This category needs a quick manual check before it goes public. Check back soon."
            : "Your listing is on the board now, unclaimed and free. Anyone can claim it, including you."}
        </p>
        {!result.pendingReview && (
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Link
              href={`/listing/${result.listingId}`}
              className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground"
            >
              View listing
            </Link>
            <Link
              href={`/claim/${result.listingId}`}
              className="rounded-full bg-saffron px-5 py-2.5 text-sm font-bold text-black"
            >
              Claim #1 now
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <Section title="What are you listing?">
        <Field label="URL" error={touched.url ? errors.url : undefined}>
          <input
            type="url"
            placeholder="https://yourproduct.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => markTouched("url")}
            className={inputClass(touched.url && !!errors.url)}
          />
        </Field>
        <Field label="Title" error={touched.title ? errors.title : undefined} hint={`${title.length}/${MAX_TITLE}`}>
          <input
            type="text"
            placeholder="Your product or business name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => markTouched("title")}
            maxLength={MAX_TITLE}
            className={inputClass(touched.title && !!errors.title)}
          />
        </Field>
        <Field
          label="Description"
          error={touched.description ? errors.description : undefined}
          hint={`${description.length}/${MAX_DESCRIPTION}`}
        >
          <textarea
            placeholder="One or two sentences on what this is."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => markTouched("description")}
            maxLength={MAX_DESCRIPTION}
            rows={3}
            className={inputClass(touched.description && !!errors.description)}
          />
        </Field>
      </Section>

      <Section title="Where does it belong?">
        <Field label="Category" error={touched.category ? errors.category : undefined}>
          <div className="flex flex-col gap-3">
            {categoryGroups.map((group) => {
              const groupCategories = categories.filter((c) => c.group === group);
              if (groupCategories.length === 0) return null;
              return (
                <div key={group} className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">
                    {group}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {groupCategories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setCategoryId(cat.id);
                          markTouched("category");
                        }}
                        className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
                          categoryId === cat.id
                            ? "border-saffron bg-saffron/15 text-saffron"
                            : "border-border bg-surface text-foreground/80 hover:border-saffron/50"
                        }`}
                      >
                        <span aria-hidden="true">{cat.icon}</span>
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Field>

        <Field label="Board" error={touched.city ? errors.city : undefined}>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setBoard("national")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                board === "national" ? "bg-foreground text-background" : "bg-surface text-foreground/70"
              }`}
            >
              🇮🇳 National
            </button>
            <button
              type="button"
              onClick={() => setBoard("city")}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                board === "city" ? "bg-foreground text-background" : "bg-surface text-foreground/70"
              }`}
            >
              Local city
            </button>
          </div>
          {board === "city" && (
            <div className="mt-2 flex flex-wrap gap-2">
              {cities.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setCityId(c.id);
                    markTouched("city");
                  }}
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                    cityId === c.id
                      ? "border-saffron bg-saffron/15 text-saffron"
                      : "border-border bg-surface text-foreground/80"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </Field>
      </Section>

      <Section title="Add a screenshot (optional)">
        <div className="flex items-center gap-4">
          {screenshotPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={screenshotPreview}
              alt="Screenshot preview"
              className="h-20 w-32 rounded-lg object-cover"
            />
          ) : (
            <div className="flex h-20 w-32 items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted">
              No image
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="w-fit cursor-pointer rounded-full border border-border px-4 py-2 text-sm font-semibold text-foreground/80 hover:border-saffron">
              {screenshot ? "Change image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onScreenshotChange(e.target.files?.[0] ?? null)}
              />
            </label>
            {screenshot && (
              <button
                type="button"
                onClick={() => onScreenshotChange(null)}
                className="text-xs text-muted underline"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </Section>

      <Section title="How can we reach you?">
        <Field
          label="Phone number"
          error={touched.phone ? errors.phone : undefined}
          hint="Used to prevent spam and to help you claim this listing later."
        >
          <input
            type="tel"
            placeholder="98765 43210"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onBlur={() => markTouched("phone")}
            className={inputClass(touched.phone && !!errors.phone)}
          />
        </Field>
      </Section>

      {result?.kind === "duplicate" && (
        <div className="rounded-2xl border border-saffron/40 bg-saffron/10 p-3 text-center text-sm text-foreground/85">
          {result.existingTitle}{" "}
          <Link href={`/listing/${result.existingListingId}`} className="font-semibold text-saffron underline">
            View it
          </Link>{" "}
          or{" "}
          <Link href={`/claim/${result.existingListingId}`} className="font-semibold text-saffron underline">
            claim it
          </Link>
          .
        </div>
      )}
      {result?.kind === "error" && (
        <div className="rounded-2xl border border-danger/40 bg-danger/10 p-3 text-center text-sm text-danger">
          {result.message}
        </div>
      )}

      <p className="text-xs text-muted">
        Listings in Adult, Gambling, or MLM categories are held for a quick manual review before going
        public. By submitting, you confirm this listing is accurate and you&apos;re not impersonating anyone.
      </p>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-saffron px-6 py-3.5 text-sm font-bold text-black transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "Adding your listing…" : "Add listing, it's free"}
      </button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-bold text-foreground">{title}</h2>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between text-sm font-medium text-foreground/80">
        {label}
        {hint && !error && <span className="text-xs text-muted">{hint}</span>}
      </span>
      {children}
      {error && <span className="text-xs text-danger">{error}</span>}
    </label>
  );
}

function inputClass(hasError: boolean): string {
  return `rounded-xl border bg-surface px-3.5 py-2.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-saffron ${
    hasError ? "border-danger" : "border-border"
  }`;
}
