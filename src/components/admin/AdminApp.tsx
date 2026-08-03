import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  LogOut,
  Plus,
  Save,
  Trash2,
  Upload,
} from "lucide-react";
import type { CmsBundle, CmsProject, CmsSiteSettings, CmsSections } from "@/lib/cms.types";
import { CMS_SECTION_IDS, type CmsSectionId } from "@/lib/cms-sections";
import { cn } from "@/lib/utils";

type AdminUser = { email: string; name: string; picture?: string };
type Status = { type: "idle" | "loading" | "success" | "error"; message?: string };

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
            cancel_on_tap_outside?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, string | number>,
          ) => void;
        };
      };
    };
  }
}

const NAV: Array<{ id: string; label: string }> = [
  { id: "settings", label: "Brand & SEO" },
  { id: "links", label: "Links" },
  { id: "chat", label: "Chat widget" },
  { id: "nav", label: "Navbar / Footer" },
  { id: "hero", label: "Hero" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "portfolio", label: "Portfolio labels" },
  { id: "projects", label: "Projects" },
  { id: "process", label: "Process" },
  { id: "tech_stack", label: "Tech stack" },
  { id: "why_me", label: "Why me" },
  { id: "pricing", label: "Pricing" },
  { id: "hire", label: "Hire platforms" },
  { id: "testimonials", label: "Testimonials" },
  { id: "faq", label: "FAQ" },
  { id: "contact", label: "Contact" },
  { id: "lead_capture", label: "Lead popup" },
];

function fieldClass() {
  return "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-ring/30";
}

function Label({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{children}</label>;
}

function StatusBanner({ status }: { status: Status }) {
  if (status.type === "idle") return null;
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
        status.type === "loading" && "bg-muted text-muted-foreground",
        status.type === "success" && "bg-emerald-500/10 text-emerald-400",
        status.type === "error" && "bg-destructive/10 text-destructive",
      )}
    >
      {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {status.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : null}
      {status.type === "error" ? <AlertCircle className="h-4 w-4" /> : null}
      <span>{status.message}</span>
    </div>
  );
}

function JsonEditor({
  value,
  onChange,
  rows = 18,
}: {
  value: unknown;
  onChange: (next: unknown) => void;
  rows?: number;
}) {
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setText(JSON.stringify(value, null, 2));
    setError(null);
  }, [value]);

  return (
    <div className="space-y-2">
      <textarea
        rows={rows}
        value={text}
        className={cn(fieldClass(), "font-mono text-xs leading-5")}
        onChange={(e) => {
          const next = e.target.value;
          setText(next);
          try {
            onChange(JSON.parse(next));
            setError(null);
          } catch {
            setError("Invalid JSON — fix before saving.");
          }
        }}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch("/api/admin/cms/upload", { method: "POST", body: form });
  const json = (await res.json()) as { success: boolean; url?: string; error?: string };
  if (!res.ok || !json.success || !json.url) throw new Error(json.error || "Upload failed");
  return json.url;
}

function ImageUrlField({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      {label ? <Label>{label}</Label> : null}
      <div className="flex gap-2">
        <input className={fieldClass()} value={value} onChange={(e) => onChange(e.target.value)} />
        <button
          type="button"
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 text-sm hover:bg-muted"
          onClick={() => inputRef.current?.click()}
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Upload
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setBusy(true);
            setErr(null);
            try {
              onChange(await uploadImage(file));
            } catch (error) {
              setErr(error instanceof Error ? error.message : "Upload failed");
            } finally {
              setBusy(false);
            }
          }}
        />
      </div>
      {value && /\.(png|jpe?g|webp|gif|svg)(\?|$)/i.test(value) ? (
        <img src={value} alt="" className="mt-2 h-24 w-24 rounded-lg object-cover ring-1 ring-border" />
      ) : null}
      {err ? <p className="mt-1 text-xs text-destructive">{err}</p> : null}
    </div>
  );
}

function emptyProject(): CmsProject {
  return {
    id: "",
    slug: "",
    title: "",
    description: "",
    category: "Mobile Apps",
    tech: [],
    demoUrl: "#",
    githubUrl: "#",
    problem: "",
    solution: "",
    role: "",
    features: [],
    impact: "",
    coverUrl: "",
    galleryUrls: [],
    order: 99,
    published: true,
  };
}

export function AdminApp() {
  const [boot, setBoot] = useState(true);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);
  const [allowlist, setAllowlist] = useState<string[]>([]);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [cms, setCms] = useState<CmsBundle | null>(null);
  const [tab, setTab] = useState("settings");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [projectDraft, setProjectDraft] = useState<CmsProject | null>(null);
  const googleBtn = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  const loadMe = useCallback(async () => {
    const res = await fetch("/api/admin/me");
    const json = (await res.json()) as {
      authenticated: boolean;
      firebaseConfigured: boolean;
      allowlist?: string[];
      admin?: AdminUser;
    };
    setFirebaseConfigured(json.firebaseConfigured);
    if (json.allowlist) setAllowlist(json.allowlist);
    if (json.authenticated && json.admin) {
      setAdmin(json.admin);
      return true;
    }
    setAdmin(null);
    return false;
  }, []);

  const loadCms = useCallback(async () => {
    const res = await fetch("/api/admin/cms");
    const json = (await res.json()) as {
      success: boolean;
      firebaseConfigured?: boolean;
      data?: CmsBundle;
      error?: string;
    };
    if (!res.ok || !json.success || !json.data) {
      throw new Error(json.error || "Failed to load CMS");
    }
    setFirebaseConfigured(Boolean(json.firebaseConfigured));
    setCms(json.data);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const ok = await loadMe();
        if (ok) await loadCms();
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : "Boot failed");
      } finally {
        setBoot(false);
      }
    })();
  }, [loadMe, loadCms]);

  const onGoogleCredential = useCallback(
    async (credential: string) => {
      setLoginBusy(true);
      setLoginError(null);
      try {
        const res = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ credential }),
        });
        const json = (await res.json()) as {
          success: boolean;
          error?: string;
          admin?: AdminUser;
        };
        if (!res.ok || !json.success || !json.admin) {
          throw new Error(json.error || "Login failed");
        }
        setAdmin(json.admin);
        await loadCms();
      } catch (err) {
        setLoginError(err instanceof Error ? err.message : "Login failed");
      } finally {
        setLoginBusy(false);
      }
    },
    [loadCms],
  );

  useEffect(() => {
    if (admin || boot || !clientId || !googleBtn.current) return;
    const scriptId = "google-gsi";
    const render = () => {
      if (!window.google?.accounts?.id || !googleBtn.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (r) => void onGoogleCredential(r.credential),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      googleBtn.current.innerHTML = "";
      window.google.accounts.id.renderButton(googleBtn.current, {
        theme: "filled_black",
        size: "large",
        text: "signin_with",
        shape: "pill",
        width: 320,
      });
    };
    if (!document.getElementById(scriptId)) {
      const s = document.createElement("script");
      s.id = scriptId;
      s.src = "https://accounts.google.com/gsi/client";
      s.async = true;
      s.onload = render;
      document.head.appendChild(s);
    } else {
      render();
    }
  }, [admin, boot, clientId, onGoogleCredential]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setAdmin(null);
    setCms(null);
  }

  async function saveSettings(next: CmsSiteSettings) {
    setStatus({ type: "loading", message: "Saving…" });
    const res = await fetch("/api/admin/cms/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ settings: next }),
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    if (!res.ok || !json.success) {
      setStatus({ type: "error", message: json.error || "Save failed" });
      return;
    }
    setCms((c) => (c ? { ...c, settings: next } : c));
    setStatus({ type: "success", message: "Saved to Firebase." });
  }

  async function saveSection(id: CmsSectionId, data: CmsSections[CmsSectionId]) {
    setStatus({ type: "loading", message: "Saving…" });
    const res = await fetch(`/api/admin/cms/sections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    if (!res.ok || !json.success) {
      setStatus({ type: "error", message: json.error || "Save failed" });
      return;
    }
    setCms((c) => (c ? { ...c, sections: { ...c.sections, [id]: data } } : c));
    setStatus({ type: "success", message: `${id} saved.` });
  }

  async function saveProject(project: CmsProject) {
    if (!project.slug.trim()) {
      setStatus({ type: "error", message: "Slug is required." });
      return;
    }
    setStatus({ type: "loading", message: "Saving project…" });
    const payload = {
      ...project,
      id: project.id || project.slug,
      tech: Array.isArray(project.tech) ? project.tech : String(project.tech).split(",").map((s) => s.trim()).filter(Boolean),
      features: Array.isArray(project.features)
        ? project.features
        : String(project.features).split("\n").map((s) => s.trim()).filter(Boolean),
      galleryUrls: Array.isArray(project.galleryUrls)
        ? project.galleryUrls
        : String(project.galleryUrls)
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
    };
    const res = await fetch(`/api/admin/cms/projects/${encodeURIComponent(payload.slug)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ project: payload }),
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    if (!res.ok || !json.success) {
      setStatus({ type: "error", message: json.error || "Save failed" });
      return;
    }
    setCms((c) => {
      if (!c) return c;
      const others = c.projects.filter((p) => p.slug !== payload.slug);
      return {
        ...c,
        projects: [...others, payload].sort((a, b) => a.order - b.order),
      };
    });
    setProjectDraft(null);
    setStatus({ type: "success", message: "Project saved." });
  }

  async function deleteProject(slug: string) {
    if (!window.confirm(`Delete project "${slug}"?`)) return;
    setStatus({ type: "loading", message: "Deleting…" });
    const res = await fetch(`/api/admin/cms/projects/${encodeURIComponent(slug)}`, {
      method: "DELETE",
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    if (!res.ok || !json.success) {
      setStatus({ type: "error", message: json.error || "Delete failed" });
      return;
    }
    setCms((c) => (c ? { ...c, projects: c.projects.filter((p) => p.slug !== slug) } : c));
    setStatus({ type: "success", message: "Project deleted." });
  }

  const settings = cms?.settings;
  const sections = cms?.sections;

  const sectionEditor = useMemo(() => {
    if (!sections) return null;
    if (!(CMS_SECTION_IDS as readonly string[]).includes(tab)) return null;
    const id = tab as CmsSectionId;
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold capitalize">{id.replace("_", " ")}</h2>
            <p className="text-sm text-muted-foreground">
              Edit JSON then save. Arrays replace fully on save.
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground"
            onClick={() => void saveSection(id, sections[id])}
          >
            <Save className="h-4 w-4" /> Save section
          </button>
        </div>
        {id === "about" ? (
          <ImageUrlField
            label="Portrait URL"
            value={sections.about.portraitUrl}
            onChange={(url) =>
              setCms((c) =>
                c
                  ? {
                      ...c,
                      sections: {
                        ...c.sections,
                        about: { ...c.sections.about, portraitUrl: url },
                      },
                    }
                  : c,
              )
            }
          />
        ) : null}
        <JsonEditor
          value={sections[id]}
          onChange={(next) =>
            setCms((c) =>
              c
                ? {
                    ...c,
                    sections: { ...c.sections, [id]: next as CmsSections[CmsSectionId] },
                  }
                : c,
            )
          }
        />
      </div>
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, tab]);

  if (boot) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,#1a2235,transparent_55%),#0b0f17] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-surface/90 p-8 shadow-2xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">NexaSoft CMS</p>
          <h1 className="mt-2 text-2xl font-semibold text-foreground">Admin login</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with an allowed Google account to manage site content.
          </p>
          <ul className="mt-4 space-y-1 rounded-xl border border-border bg-background/40 p-3 text-xs text-muted-foreground">
            {(allowlist.length ? allowlist : ["ssnexasoft777@gmail.com", "shahedroks@gmail.com"]).map(
              (email) => (
                <li key={email}>• {email}</li>
              ),
            )}
          </ul>
          <div className="mt-6 flex justify-center" ref={googleBtn} />
          {!clientId ? (
            <p className="mt-3 text-sm text-destructive">Missing VITE_GOOGLE_CLIENT_ID in .env</p>
          ) : null}
          {loginBusy ? (
            <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
            </p>
          ) : null}
          {loginError ? (
            <p className="mt-3 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" /> {loginError}
            </p>
          ) : null}
          <a href="/" className="mt-6 inline-flex items-center gap-1 text-sm text-accent hover:underline">
            ← Back to site <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    );
  }

  if (!cms || !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading CMS…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-foreground">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b0f17]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-accent">Admin CMS</p>
            <h1 className="text-lg font-semibold">{settings.brandName}</h1>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "hidden rounded-full px-2.5 py-1 text-xs sm:inline",
                firebaseConfigured
                  ? "bg-emerald-500/15 text-emerald-300"
                  : "bg-amber-500/15 text-amber-300",
              )}
            >
              {firebaseConfigured ? "Firebase connected" : "Firebase offline (local defaults)"}
            </span>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2 py-1 pr-3">
              {admin.picture ? (
                <img src={admin.picture} alt="" className="h-7 w-7 rounded-full" />
              ) : (
                <span className="grid h-7 w-7 place-items-center rounded-full bg-accent/20 text-xs">
                  {admin.name.slice(0, 1)}
                </span>
              )}
              <span className="hidden max-w-[10rem] truncate text-xs sm:inline">{admin.email}</span>
            </div>
            <button
              type="button"
              onClick={() => void logout()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm hover:bg-white/5"
            >
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[220px_1fr]">
        <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.03] p-2 lg:sticky lg:top-20">
          <nav className="flex gap-1 overflow-x-auto lg:flex-col">
            {NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition",
                  tab === item.id
                    ? "bg-accent/20 text-accent"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6">
          <StatusBanner status={status} />
          {!firebaseConfigured ? (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
              Firebase is not configured. Add <code>serviceAccountKey.json</code>, run{" "}
              <code>npm run seed:cms</code>, then restart. Saves will fail until then.
            </div>
          ) : null}

          {tab === "settings" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Brand & SEO</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground"
                  onClick={() => void saveSettings(settings)}
                >
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
              {(
                [
                  ["brandName", "Brand name"],
                  ["availabilityLabel", "Availability label"],
                  ["ctaLabel", "CTA label"],
                ] as const
              ).map(([key, label]) => (
                <div key={key}>
                  <Label>{label}</Label>
                  <input
                    className={fieldClass()}
                    value={settings[key]}
                    onChange={(e) =>
                      setCms((c) =>
                        c ? { ...c, settings: { ...c.settings, [key]: e.target.value } } : c,
                      )
                    }
                  />
                </div>
              ))}
              <div>
                <Label>SEO title</Label>
                <input
                  className={fieldClass()}
                  value={settings.seo.title}
                  onChange={(e) =>
                    setCms((c) =>
                      c
                        ? {
                            ...c,
                            settings: {
                              ...c.settings,
                              seo: { ...c.settings.seo, title: e.target.value },
                            },
                          }
                        : c,
                    )
                  }
                />
              </div>
              <div>
                <Label>SEO description</Label>
                <textarea
                  rows={3}
                  className={fieldClass()}
                  value={settings.seo.description}
                  onChange={(e) =>
                    setCms((c) =>
                      c
                        ? {
                            ...c,
                            settings: {
                              ...c.settings,
                              seo: { ...c.settings.seo, description: e.target.value },
                            },
                          }
                        : c,
                    )
                  }
                />
              </div>
            </div>
          ) : null}

          {tab === "links" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Public links</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground"
                  onClick={() => void saveSettings(settings)}
                >
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
              {(
                Object.keys(settings.links) as Array<keyof typeof settings.links>
              ).map((key) => (
                <div key={key}>
                  <Label>{key}</Label>
                  {key === "estimatePdfUrl" ? (
                    <ImageUrlField
                      value={settings.links[key]}
                      onChange={(url) =>
                        setCms((c) =>
                          c
                            ? {
                                ...c,
                                settings: {
                                  ...c.settings,
                                  links: { ...c.settings.links, estimatePdfUrl: url },
                                },
                              }
                            : c,
                        )
                      }
                    />
                  ) : (
                    <input
                      className={fieldClass()}
                      value={settings.links[key]}
                      onChange={(e) =>
                        setCms((c) =>
                          c
                            ? {
                                ...c,
                                settings: {
                                  ...c.settings,
                                  links: { ...c.settings.links, [key]: e.target.value },
                                },
                              }
                            : c,
                        )
                      }
                    />
                  )}
                </div>
              ))}
            </div>
          ) : null}

          {tab === "chat" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Chat widget</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground"
                  onClick={() => void saveSettings(settings)}
                >
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
              <JsonEditor
                value={settings.chat}
                onChange={(next) =>
                  setCms((c) =>
                    c
                      ? {
                          ...c,
                          settings: {
                            ...c.settings,
                            chat: next as CmsSiteSettings["chat"],
                          },
                        }
                      : c,
                  )
                }
              />
            </div>
          ) : null}

          {tab === "nav" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Navbar & footer</h2>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground"
                  onClick={() => void saveSettings(settings)}
                >
                  <Save className="h-4 w-4" /> Save
                </button>
              </div>
              <Label>Nav links (JSON)</Label>
              <JsonEditor
                rows={10}
                value={settings.navLinks}
                onChange={(next) =>
                  setCms((c) =>
                    c
                      ? {
                          ...c,
                          settings: {
                            ...c.settings,
                            navLinks: next as CmsSiteSettings["navLinks"],
                          },
                        }
                      : c,
                  )
                }
              />
              <Label>Footer (JSON)</Label>
              <JsonEditor
                rows={10}
                value={settings.footer}
                onChange={(next) =>
                  setCms((c) =>
                    c
                      ? {
                          ...c,
                          settings: {
                            ...c.settings,
                            footer: next as CmsSiteSettings["footer"],
                          },
                        }
                      : c,
                  )
                }
              />
            </div>
          ) : null}

          {tab === "projects" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Projects</h2>
                  <p className="text-sm text-muted-foreground">{cms.projects.length} published items</p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-white/5"
                  onClick={() => setProjectDraft(emptyProject())}
                >
                  <Plus className="h-4 w-4" /> New project
                </button>
              </div>

              <div className="space-y-2">
                {cms.projects.map((p) => (
                  <div
                    key={p.slug}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-background/40 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.slug} · {p.category} · order {p.order}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-white/5"
                        onClick={() => setProjectDraft(p)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-destructive/40 px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                        onClick={() => void deleteProject(p.slug)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {projectDraft ? (
                <div className="space-y-3 rounded-xl border border-accent/30 bg-accent/5 p-4">
                  <h3 className="font-semibold">{projectDraft.slug ? "Edit project" : "New project"}</h3>
                  {(
                    [
                      ["slug", "Slug"],
                      ["title", "Title"],
                      ["category", "Category"],
                      ["demoUrl", "Demo URL"],
                      ["githubUrl", "GitHub URL"],
                      ["impact", "Impact"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key}>
                      <Label>{label}</Label>
                      <input
                        className={fieldClass()}
                        value={String(projectDraft[key] ?? "")}
                        onChange={(e) =>
                          setProjectDraft((d) => (d ? { ...d, [key]: e.target.value } : d))
                        }
                      />
                    </div>
                  ))}
                  <div>
                    <Label>Description</Label>
                    <textarea
                      rows={3}
                      className={fieldClass()}
                      value={projectDraft.description}
                      onChange={(e) =>
                        setProjectDraft((d) => (d ? { ...d, description: e.target.value } : d))
                      }
                    />
                  </div>
                  <div>
                    <Label>Tech (comma separated)</Label>
                    <input
                      className={fieldClass()}
                      value={projectDraft.tech.join(", ")}
                      onChange={(e) =>
                        setProjectDraft((d) =>
                          d
                            ? {
                                ...d,
                                tech: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                              }
                            : d,
                        )
                      }
                    />
                  </div>
                  <ImageUrlField
                    label="Cover URL"
                    value={projectDraft.coverUrl}
                    onChange={(url) => setProjectDraft((d) => (d ? { ...d, coverUrl: url } : d))}
                  />
                  <div>
                    <Label>Gallery URLs (one per line)</Label>
                    <textarea
                      rows={3}
                      className={fieldClass()}
                      value={projectDraft.galleryUrls.join("\n")}
                      onChange={(e) =>
                        setProjectDraft((d) =>
                          d
                            ? {
                                ...d,
                                galleryUrls: e.target.value
                                  .split("\n")
                                  .map((s) => s.trim())
                                  .filter(Boolean),
                              }
                            : d,
                        )
                      }
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <Label>Order</Label>
                      <input
                        type="number"
                        className={fieldClass()}
                        value={projectDraft.order}
                        onChange={(e) =>
                          setProjectDraft((d) =>
                            d ? { ...d, order: Number(e.target.value) || 0 } : d,
                          )
                        }
                      />
                    </div>
                    <label className="mt-6 flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={projectDraft.published}
                        onChange={(e) =>
                          setProjectDraft((d) =>
                            d ? { ...d, published: e.target.checked } : d,
                          )
                        }
                      />
                      Published
                    </label>
                  </div>
                  <div>
                    <Label>Full project JSON (problem / solution / features…)</Label>
                    <JsonEditor
                      rows={12}
                      value={projectDraft}
                      onChange={(next) => setProjectDraft(next as CmsProject)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-lg bg-gradient-brand px-4 py-2 text-sm font-semibold text-primary-foreground"
                      onClick={() => void saveProject(projectDraft)}
                    >
                      <Save className="h-4 w-4" /> Save project
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-border px-4 py-2 text-sm hover:bg-white/5"
                      onClick={() => setProjectDraft(null)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {sectionEditor}
        </main>
      </div>
    </div>
  );
}
