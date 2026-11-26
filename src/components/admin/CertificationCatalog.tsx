"use client";

import { useState } from "react";
import { EditorialCatalog } from "./EditorialCatalog";
import { EditorialMediaPreview } from "./EditorialMediaPreview";
import { Field } from "./Field";
import { MediaSelect } from "./MediaSelect";

type Certification = {
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
  evidenceMediaRefs: string[];
  verified: boolean;
};

const empty: Certification = { title: "", evidenceMediaRefs: [], verified: false };

function EvidenceFields({ ids, change }: { ids: string[]; change: (ids: string[]) => void }) {
  const [selected, setSelected] = useState<string>();
  const [type, setType] = useState<"image" | "video">("image");
  return <fieldset>
    <legend>Evidencias</legend>
    <div className="admin-field">
      <label htmlFor="cert-evidence-type">Tipo de evidencia</label>
      <select id="cert-evidence-type" value={type} onChange={(event) => {
        setType(event.target.value === "video" ? "video" : "image");
        setSelected(undefined);
      }}>
        <option value="image">Imagen</option><option value="video">Video</option>
      </select>
    </div>
    <MediaSelect key={type} id="cert-evidence" label="Archivo de evidencia" type={type} value={selected} onChange={setSelected} />
    <button type="button" disabled={!selected || ids.includes(selected) || ids.length >= 100} onClick={() => {
      if (!selected) return;
      change([...ids, selected]);
      setSelected(undefined);
    }}>Agregar evidencia</button>
    {ids.length > 0 ? <ul>{ids.map((id, index) => <li key={id}>
      <EditorialMediaPreview id={id} label={`evidencia ${index + 1}`} />
      <button type="button" aria-label={`Quitar evidencia ${index + 1}`}
        onClick={() => change(ids.filter((asset) => asset !== id))}>Quitar</button>
    </li>)}</ul> : <p>No hay evidencias adjuntas.</p>}
  </fieldset>;
}

function CertificationFields({ draft, change }: { draft: Certification; change: (next: Certification) => void }) {
  return <>
    <Field id="cert-issuer" label="Organismo emisor" maxLength={160} value={draft.issuer ?? ""}
      onChange={(event) => change({ ...draft, issuer: event.target.value })} />
    <Field id="cert-date" label="Fecha de la credencial" type="date" min="0001-01-01" max="9999-12-31" value={draft.date ?? ""}
      onChange={(event) => change({ ...draft, date: event.target.value })} />
    <div className="admin-field">
      <label htmlFor="cert-description">Descripción</label>
      <textarea id="cert-description" rows={5} maxLength={4000} value={draft.description ?? ""}
        onChange={(event) => change({ ...draft, description: event.target.value })} />
    </div>
    <EvidenceFields ids={draft.evidenceMediaRefs} change={(evidenceMediaRefs) => change({ ...draft, evidenceMediaRefs })} />
    <label className="admin-check">
      <input type="checkbox" checked={draft.verified} onChange={(event) => change({ ...draft, verified: event.target.checked })} />
      Confirmo que la credencial y su organismo emisor han sido verificados.
    </label>
  </>;
}

export function CertificationCatalog() {
  return <EditorialCatalog kind="certification" noun="credencial" empty={empty}
    fields={(draft, change) => <CertificationFields draft={draft} change={change} />}
    normalize={(draft) => ({
      ...draft, issuer: draft.issuer?.trim() || undefined, date: draft.date || undefined,
      description: draft.description?.trim() || undefined,
    })}
    preview={(draft) => <>
      {draft.issuer ? <p>{draft.issuer}</p> : null}
      {draft.date ? <p><time dateTime={draft.date}>{draft.date}</time></p> : null}
      {draft.description ? <p>{draft.description}</p> : null}
      <p>{draft.verified ? "Verificación confirmada." : "Verificación pendiente."}</p>
      {draft.evidenceMediaRefs.map((id, index) => <EditorialMediaPreview key={id} id={id} label={`evidencia ${index + 1}`} />)}
    </>} />;
}
