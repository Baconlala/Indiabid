"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

const STORAGE_KEY = "indiabid_adult_consent";

type Consent = "accepted" | "declined" | null;

type Ctx = {
  consent: Consent;
  adultUnlocked: boolean;
  setConsent: (c: Consent) => void;
};

const AgeGateContext = createContext<Ctx>({ consent: null, adultUnlocked: false, setConsent: () => {} });

export function AgeGateProvider({ children }: { children: ReactNode }) {
  const [consent, setConsentState] = useState<Consent>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      // Standard hydration guard: reading localStorage can only happen client-side,
      // so this one-time sync on mount is intentional, not a derived-state smell.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored === "accepted" || stored === "declined") setConsentState(stored);
    } catch {
      // localStorage unavailable — fall through to the safe default below.
    }
    setHydrated(true);
  }, []);

  function setConsent(c: Consent) {
    setConsentState(c);
    try {
      if (c) localStorage.setItem(STORAGE_KEY, c);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore — consent still applies for this session via state.
    }
  }

  // Before we've read localStorage, assume declined (the safe default) so
  // adult content never flashes on screen for a returning "no" visitor.
  const effectiveConsent = hydrated ? consent : "declined";

  return (
    <AgeGateContext.Provider
      value={{ consent: effectiveConsent, adultUnlocked: effectiveConsent === "accepted", setConsent }}
    >
      {children}
    </AgeGateContext.Provider>
  );
}

export function useAgeGate() {
  return useContext(AgeGateContext);
}
