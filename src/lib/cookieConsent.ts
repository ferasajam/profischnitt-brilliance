export type CookieConsentChoice = "necessary" | "all";

const STORAGE_KEY = "cookie_consent_choice";

export function getCookieConsentChoice(): CookieConsentChoice | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "necessary" || raw === "all") return raw;
    return null;
  } catch {
    return null;
  }
}

export function setCookieConsentChoice(choice: CookieConsentChoice): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // ignore
  }
}

export function subscribeCookieConsentChoice(
  onChange: (choice: CookieConsentChoice | null) => void
): () => void {
  if (typeof window === "undefined") return () => undefined;

  const onStorage = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY) return;
    onChange(getCookieConsentChoice());
  };

  const onCustom = () => {
    onChange(getCookieConsentChoice());
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener("cookie-consent:changed", onCustom);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("cookie-consent:changed", onCustom);
  };
}

export function openCookieConsentBanner(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("cookie-consent:open"));
}

export function notifyCookieConsentChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("cookie-consent:changed"));
}
