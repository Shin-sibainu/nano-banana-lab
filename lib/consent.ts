"use client";

import { useEffect, useState } from "react";
import type { ConsentState } from "./types";

const CONSENT_KEY = "nano-banana-consent";

const DEFAULT_CONSENT: ConsentState = {
  personalImages: false,
  exifRemoval: true,
  generationLabel: true,
};

export function loadConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    return {
      ...DEFAULT_CONSENT,
      ...parsed,
    };
  } catch {
    return null;
  }
}

export function saveConsent(consent: ConsentState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  window.dispatchEvent(new Event("consent-updated"));
}

export function useConsent() {
  const [consent, setConsentState] = useState<ConsentState | null>(null);

  useEffect(() => {
    setConsentState(loadConsent() ?? DEFAULT_CONSENT);
  }, []);

  useEffect(() => {
    const onUpdate = () => setConsentState(loadConsent() ?? DEFAULT_CONSENT);
    window.addEventListener("consent-updated", onUpdate);
    return () => window.removeEventListener("consent-updated", onUpdate);
  }, []);

  const setConsent = (next: ConsentState) => {
    saveConsent(next);
    setConsentState(next);
  };

  return { consent: consent ?? DEFAULT_CONSENT, setConsent } as const;
}

