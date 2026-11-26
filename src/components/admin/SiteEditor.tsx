"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  CmsRequestError, listContent, previewContent, publishContent, writeDraft,
} from "@/lib/cms/content-client";
import type { CmsDraft, SitePayload } from "@/types/cms/content";
import { useCsrfToken } from "./AdminSession";
import { Field } from "./Field";
import { MediaSelect } from "./MediaSelect";
import { StatusPanel } from "./StatusPanel";

const emptySite: SitePayload = {
  brandName: "", founderName: "",
  hero: { title: "", subtitle: "" },
  about: { title: "", history: "", philosophy: "" },
  trajectory: "", contact: {}, faq: [],
  seo: { title: "", description: "" },
};

const channels: Array<{ key: keyof SitePayload["contact"]; label: string; type: string }> = [
  { key: "phone", label: "Teléfono", type: "tel" },
  { key: "whatsapp", label: "WhatsApp", type: "tel" },
  { key: "email", label: "Correo electrónico", type: "email" },
  { key: "facebook", label: "Facebook", type: "url" },
  { key: "instagram", label: "Instagram", type: "url" },
  { key: "tiktok", label: "TikTok", type: "url" },
];

function optional(value?: string) {
  return value?.trim() || undefined;
}

function normalized(site: SitePayload): SitePayload {
  const contact = Object.fromEntries(Object.entries(site.contact)
    .map(([key, value]) => [key, key === "phone" || key === "whatsapp" ? optional(value?.replace(/[().\s-]/g, "")) : optional(value)])
    .filter(([, value]) => value !== undefined));
  return {
    ...site,
    hero: { ...site.hero, subtitle: optional(site.hero.subtitle) },
    about: { ...site.about, philosophy: optional(site.about.philosophy) },
    trajectory: optional(site.trajectory),
    contact,
  };
}

function LongField({
  id, label, value, onChange, maxLength = 4000, required, error,
}: {
  id: string; label: string; value: string; onChange: (value: string) => void;
  maxLength?: number; required?: boolean; error?: string;
}) {
  return (
    <div className="admin-field">
      <label htmlFor={id}>{label}</label>
      <textarea id={id} value={value} onChange={(event) => onChange(event.target.value)} maxLength={maxLength} required={required}
        aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : undefined} rows={3} />
      {error ? <small className="admin-field-error" id={`${id}-error`}>{error}</small> : null}
    </div>
  );
}

function SitePreview({ site, close }: { site: SitePayload; close: () => void }) {
  return (
    <section className="admin-preview" aria-labelledby="site-preview-title">
      <h2 id="site-preview-title">Vista previa del borrador</h2>
      <p>{site.brandName} · {site.founderName}</p>
      <h3>{site.hero.title}</h3>
      {site.hero.subtitle ? <p>{site.hero.subtitle}</p> : null}
      <h3>{site.about.title}</h3>
      <p>{site.about.history}</p>
      {site.about.philosophy ? <p>{site.about.philosophy}</p> : null}
      {site.trajectory ? <p>{site.trajectory}</p> : null}
      {site.faq.map(({ question, answer }, index) => <details key={index}><summary>{question}</summary><p>{answer}</p></details>)}
      {Object.keys(site.contact).length > 0 ? (
        <dl>{channels.map(({ key, label }) => site.contact[key] ? <div key={key}><dt>{label}</dt><dd>{site.contact[key]}</dd></div> : null)}</dl>
      ) : null}
      <button type="button" onClick={close}>Cerrar vista previa</button>
    </section>
  );
}

export function SiteEditor() {
  const csrf = useCsrfToken();
  const [draft, setDraft] = useState<CmsDraft<SitePayload>>();
  const [form, setForm] = useState(emptySite);
  const [preview, setPreview] = useState<SitePayload>();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(0);
  const [working, setWorking] = useState(false);
  const [issue, setIssue] = useState<CmsRequestError>();
  const [notice, setNotice] = useState("");
  const dirty = JSON.stringify(normalized(form)) !== JSON.stringify(normalized(draft?.payload ?? emptySite));

  useEffect(() => {
    const cancel = new AbortController();
    listContent<SitePayload>("site", cancel.signal).then(({ items }) => {
      if (cancel.signal.aborted) return;
      const current = items[0];
      setDraft(current);
      setForm(current?.payload ?? emptySite);
      setLoading(false);
    }).catch((error: unknown) => {
      if (cancel.signal.aborted) return;
      setIssue(error instanceof CmsRequestError ? error : new CmsRequestError(503, "No se pudo cargar el contenido."));
      setLoading(false);
    });
    return () => cancel.abort();
  }, [attempt]);

  function reload() {
    setIssue(undefined);
    setPreview(undefined);
    setLoading(true);
    setAttempt((last) => last + 1);
  }

  function change<T extends keyof SitePayload>(key: T, value: SitePayload[T]) {
    setForm((current) => ({ ...current, [key]: value }));
    setPreview(undefined);
    setNotice("");
  }

  async function operation(run: () => Promise<void>) {
    setWorking(true);
    setIssue(undefined);
    setNotice("");
    try {
      await run();
    } catch (error) {
      setIssue(error instanceof CmsRequestError ? error : new CmsRequestError(503, "No se pudo completar la operación."));
    } finally {
      setWorking(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void operation(async () => {
      const entry = await writeDraft("site", { slug: "site", position: 0, payload: normalized(form) }, csrf, draft);
      setDraft(entry);
      setForm(entry.payload);
      setPreview(undefined);
      setNotice("Borrador guardado.");
    });
  }

  function editQuestion(index: number, key: "question" | "answer", value: string) {
    change("faq", form.faq.map((row, position) => position === index ? { ...row, [key]: value } : row));
  }

  if (loading) return <StatusPanel kind="loading">Cargando contenido institucional…</StatusPanel>;
  if (issue?.status === 401) return <StatusPanel kind="error">La sesión terminó. Vuelve a iniciar sesión para continuar.</StatusPanel>;
  const errors = issue?.fieldErrors ?? {};

  return (
    <>
      {issue ? <StatusPanel kind="error"><p>{issue.message}</p>
        {issue.status === 409 || issue.status === 503 ? <button type="button" onClick={reload}>Recargar</button> : null}
      </StatusPanel> : null}
      {notice ? <p role="status">{notice}</p> : null}
      {dirty ? <p role="status">Hay cambios sin guardar.</p> : null}
      <form className="admin-editor" method="post" onSubmit={submit}>
        <fieldset>
          <legend>Identidad</legend>
          <Field id="brand-name" label="Nombre de marca" required maxLength={160} value={form.brandName}
            error={errors.brandName} onChange={(event) => change("brandName", event.target.value)} />
          <Field id="founder-name" label="Nombre de la fundadora" required maxLength={160} value={form.founderName}
            error={errors.founderName} onChange={(event) => change("founderName", event.target.value)} />
        </fieldset>
        <fieldset>
          <legend>Presentación e historia</legend>
          <Field id="hero-title" label="Título principal" required maxLength={160} value={form.hero.title}
            error={errors["hero.title"]} onChange={(event) => change("hero", { ...form.hero, title: event.target.value })} />
          <MediaSelect id="hero-photo" label="Foto principal" type="image" value={form.hero.photoRef}
            onChange={(photoRef) => change("hero", { ...form.hero, photoRef })} />
          <MediaSelect id="about-photo" label="Retrato institucional" type="image" value={form.about.portraitRef}
            onChange={(portraitRef) => change("about", { ...form.about, portraitRef })} />
          <LongField id="hero-summary" label="Subtítulo" value={form.hero.subtitle ?? ""}
            error={errors["hero.subtitle"]} onChange={(value) => change("hero", { ...form.hero, subtitle: value })} />
          <Field id="about-title" label="Título de historia" required maxLength={160} value={form.about.title}
            error={errors["about.title"]} onChange={(event) => change("about", { ...form.about, title: event.target.value })} />
          <LongField id="about-history" label="Historia" required value={form.about.history}
            error={errors["about.history"]} onChange={(value) => change("about", { ...form.about, history: value })} />
          <LongField id="about-philosophy" label="Filosofía" value={form.about.philosophy ?? ""}
            error={errors["about.philosophy"]} onChange={(value) => change("about", { ...form.about, philosophy: value })} />
          <LongField id="trajectory" label="Trayectoria" value={form.trajectory ?? ""}
            error={errors.trajectory} onChange={(value) => change("trajectory", value)} />
        </fieldset>
        <fieldset>
          <legend>Contacto</legend>
          {channels.map(({ key, label, type }) => <Field key={key} id={`contact-${key}`} label={label} type={type}
            value={form.contact[key] ?? ""} error={errors[`contact.${key}`]}
            onChange={(event) => change("contact", { ...form.contact, [key]: event.target.value })} />)}
        </fieldset>
        <fieldset>
          <legend>Preguntas frecuentes</legend>
          {form.faq.map(({ question, answer }, index) => (
            <div className="admin-faq-row" key={index}>
              <Field id={`faq-${index}-question`} label={`Pregunta ${index + 1}`} required maxLength={160} value={question}
                onChange={(event) => editQuestion(index, "question", event.target.value)} />
              <LongField id={`faq-${index}-answer`} label={`Respuesta ${index + 1}`} required value={answer}
                onChange={(value) => editQuestion(index, "answer", value)} />
              <button type="button" onClick={() => change("faq", form.faq.filter((_, position) => position !== index))}>
                Quitar pregunta {index + 1}
              </button>
            </div>
          ))}
          <button type="button" disabled={form.faq.length >= 50}
            onClick={() => change("faq", [...form.faq, { question: "", answer: "" }])}>Añadir pregunta</button>
        </fieldset>
        <fieldset>
          <legend>Metadatos</legend>
          <Field id="seo-title" label="Título SEO" required maxLength={160} value={form.seo.title}
            error={errors["seo.title"]} onChange={(event) => change("seo", { ...form.seo, title: event.target.value })} />
          <LongField id="seo-summary" label="Descripción SEO" required maxLength={300} value={form.seo.description}
            error={errors["seo.description"]} onChange={(value) => change("seo", { ...form.seo, description: value })} />
        </fieldset>
        <div className="admin-editor-actions">
          <button type="submit" disabled={working}>Guardar borrador</button>
          <button type="button" disabled={working || dirty || !draft} onClick={() => {
            if (draft) void operation(async () => setPreview((await previewContent<SitePayload>("site", draft.id)).payload));
          }}>Previsualizar</button>
          <button type="button" disabled={working || dirty || !draft} onClick={() => {
            if (!draft) return;
            void operation(async () => {
              const entry = await publishContent<SitePayload>("site", draft, csrf);
              setDraft(entry);
              setForm(entry.payload);
              setNotice("Contenido publicado.");
            });
          }}>Publicar</button>
        </div>
      </form>
      {preview ? <SitePreview site={preview} close={() => setPreview(undefined)} /> : null}
    </>
  );
}
