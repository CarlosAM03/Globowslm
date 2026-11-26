"use client";

import { EditorialCatalog } from "./EditorialCatalog";
import { EditorialMediaPreview } from "./EditorialMediaPreview";
import { MediaSelect } from "./MediaSelect";

const types = {
  COURSE: { label: "Curso presencial", interest: "cursos" },
  WORKSHOP: { label: "Taller presencial", interest: "talleres" },
  ADVICE: { label: "Asesoría presencial", interest: "asesorias" },
  CERTIFICATION: { label: "Oferta de certificación presencial", interest: "certificaciones" },
} as const;
const interests = {
  cursos: "Consultar cursos", talleres: "Consultar talleres", asesorias: "Consultar asesorías",
  certificaciones: "Consultar certificaciones", general: "Consulta general", decoracion: "Consultar decoración",
} as const;

type Training = {
  title: string;
  description: string;
  trainingType: keyof typeof types;
  ctaInterest: keyof typeof interests;
  photoRef?: string;
  videoRef?: string;
};

const empty: Training = { title: "", description: "", trainingType: "COURSE", ctaInterest: "cursos" };
const typeKeys = Object.keys(types) as Training["trainingType"][];
const interestKeys = Object.keys(interests) as Training["ctaInterest"][];

function TrainingFields({ draft, change }: { draft: Training; change: (next: Training) => void }) {
  return <>
    <div className="admin-field">
      <label htmlFor="training-description">Descripción</label>
      <textarea id="training-description" required rows={5} maxLength={4000} value={draft.description}
        onChange={(event) => change({ ...draft, description: event.target.value })} />
    </div>
    <div className="admin-field">
      <label htmlFor="training-type">Tipo de formación presencial</label>
      <select id="training-type" value={draft.trainingType} onChange={(event) => {
        const trainingType = event.target.value as Training["trainingType"];
        change({ ...draft, trainingType, ctaInterest: types[trainingType].interest });
      }}>
        {typeKeys.map((key) => <option key={key} value={key}>{types[key].label}</option>)}
      </select>
    </div>
    <div className="admin-field">
      <label htmlFor="training-interest">Motivo de contacto</label>
      <select id="training-interest" value={draft.ctaInterest}
        onChange={(event) => change({ ...draft, ctaInterest: event.target.value as Training["ctaInterest"] })}>
        {interestKeys.map((key) => <option key={key} value={key}>{interests[key]}</option>)}
      </select>
    </div>
    <MediaSelect id="training-photo" label="Fotografía" type="image" value={draft.photoRef}
      onChange={(photoRef) => change({ ...draft, photoRef })} />
    <MediaSelect id="training-video" label="Video" type="video" value={draft.videoRef}
      onChange={(videoRef) => change({ ...draft, videoRef })} />
  </>;
}

export function TrainingCatalog() {
  return <EditorialCatalog kind="training" noun="oferta" empty={empty}
    fields={(draft, change) => <TrainingFields draft={draft} change={change} />}
    normalize={(draft) => ({ ...draft, description: draft.description.trim() })}
    preview={(draft) => <>
      <p>{types[draft.trainingType].label}</p>
      <p>{draft.description}</p>
      <p>{interests[draft.ctaInterest]}</p>
      {draft.photoRef ? <EditorialMediaPreview id={draft.photoRef} type="image" label="fotografía" /> : null}
      {draft.videoRef ? <EditorialMediaPreview id={draft.videoRef} type="video" label="video" /> : null}
    </>} />;
}
