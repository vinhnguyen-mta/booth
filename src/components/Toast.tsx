import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

// --------------- Types -----------------
type ToastKind = "success" | "error" | "info" | "warning";

export type ToastOptions = {
  message: React.ReactNode;
  title?: string;
  kind?: ToastKind; // default: 'info'
  duration?: number; // ms, default: 3000
  id?: string; // optional custom id
  action?: { label: string; onClick: () => void };
};

type ToastItem = Required<Pick<ToastOptions, "message" | "kind">> &
  Omit<ToastOptions, "message" | "kind"> & {
    id: string;
    createdAt: number;
  };

type ToastContextType = {
  show: (opts: ToastOptions) => string; // returns id
  dismiss: (id: string) => void;
  dismissAll: () => void;
};

// --------------- Context + singleton -----------------
const ToastContext = createContext<ToastContextType | null>(null);

let externalShow: ((opts: ToastOptions) => string) | null = null;
let externalDismiss: ((id: string) => void) | null = null;
let externalDismissAll: (() => void) | null = null;

export const toast = {
  /** Imperative API – call from anywhere (after <ToastProvider/> mounts) */
  show(opts: ToastOptions) {
    if (!externalShow) {
      console.warn("[toast] ToastProvider is not mounted yet.");
      return "";
    }
    return externalShow(opts);
  },
  error(
    message: React.ReactNode,
    opts: Omit<ToastOptions, "message" | "kind"> = {}
  ) {
    return this.show({ ...opts, message, kind: "error" });
  },
  success(
    message: React.ReactNode,
    opts: Omit<ToastOptions, "message" | "kind"> = {}
  ) {
    return this.show({ ...opts, message, kind: "success" });
  },
  info(
    message: React.ReactNode,
    opts: Omit<ToastOptions, "message" | "kind"> = {}
  ) {
    return this.show({ ...opts, message, kind: "info" });
  },
  warning(
    message: React.ReactNode,
    opts: Omit<ToastOptions, "message" | "kind"> = {}
  ) {
    return this.show({ ...opts, message, kind: "warning" });
  },
  dismiss(id: string) {
    externalDismiss?.(id);
  },
  dismissAll() {
    externalDismissAll?.();
  },
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider/>");
  return ctx;
}

// --------------- Provider -----------------
export default function ToastProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idCounter = useRef(0);

  const show = useCallback((opts: ToastOptions) => {
    const id = opts.id ?? `${Date.now()}-${++idCounter.current}`;
    const item: ToastItem = {
      id,
      message: opts.message,
      title: opts.title,
      kind: opts.kind ?? "info",
      duration: Math.max(1000, opts.duration ?? 3000),
      action: opts.action,
      createdAt: Date.now(),
    };
    setToasts((prev) => [...prev, item]);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  // Expose imperative functions after mount
  useEffect(() => {
    externalShow = show;
    externalDismiss = dismiss;
    externalDismissAll = dismissAll;
    return () => {
      externalShow = null;
      externalDismiss = null;
      externalDismissAll = null;
    };
  }, [show, dismiss, dismissAll]);

  // Auto-dismiss timers
  useEffect(() => {
    const timers = toasts.map((t) => {
      const remaining = Math.max(
        0,
        (t.duration ?? 3000) - (Date.now() - t.createdAt)
      );
      const tm = setTimeout(() => dismiss(t.id), remaining);
      return tm;
    });
    return () => {
      timers.forEach(clearTimeout);
    };
  }, [toasts, dismiss]);

  // Render container using a portal
  const container = (
    <div className="pointer-events-none fixed inset-0 z-[9999] flex flex-col items-end gap-2 p-4 sm:p-6">
      <div className="pointer-events-auto ml-auto flex w-full max-w-md flex-col gap-2">
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} onClose={() => dismiss(t.id)} />
        ))}
      </div>
    </div>
  );

  return (
    <ToastContext.Provider value={{ show, dismiss, dismissAll }}>
      {children}
      {typeof document !== "undefined"
        ? createPortal(container, document.body)
        : null}
    </ToastContext.Provider>
  );
}

// --------------- UI -----------------
function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem;
  onClose: () => void;
}) {
  const kind = item.kind;
  const kindStyles = getKindStyles(kind);
  const ariaLive = kind === "error" ? "assertive" : "polite";

  return (
    <div
      role="alert"
      aria-live={ariaLive}
      className={`rounded-2xl shadow-xl ring-1 ring-black/5 px-4 py-3 transition duration-300 bg-white text-gray-900 dark:bg-neutral-900 dark:text-white ${kindStyles.container}`}
    >
      <div className="flex items-start gap-3 items-center justify-center">
        <KindIcon kind={kind} />
        <div className="flex-1 items-center justify-center">
          {item.title && (
            <div className="font-semibold leading-5">{item.title}</div>
          )}
          <div className="text-sm leading-5">{item.message}</div>
          {item.action && (
            <button
              onClick={item.action.onClick}
              className="mt-2 inline-flex items-center rounded-lg px-3 py-1 text-sm font-medium hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              {item.action.label}
            </button>
          )}
        </div>
        <button
          aria-label="Đóng"
          onClick={onClose}
          className="rounded-full p-1.5 text-lg leading-none opacity-80 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          ×
        </button>
      </div>
    </div>
  );
}

function getKindStyles(kind: ToastKind) {
  switch (kind) {
    case "success":
      return { container: "border border-emerald-200/60" };
    case "warning":
      return { container: "border border-amber-200/60" };
    case "error":
      return { container: "bg-red-600 text-white" };
    case "info":
    default:
      return { container: "border border-sky-200/60" };
  }
}

function KindIcon({ kind }: { kind: ToastKind }) {
  const base =
    "mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold";
  if (kind === "success")
    return <span className={`${base} bg-emerald-600 text-white`}>✓</span>;
  if (kind === "warning")
    return <span className={`${base} bg-amber-500 text-black`}>!</span>;
  if (kind === "error")
    return (
      <span className={`${base} bg-white/20 text-white ring-1 ring-white/60`}>
        !
      </span>
    );
  return <span className={`${base} bg-sky-600 text-white`}>i</span>;
}

/* ----------------------------------
USAGE (Ví dụ):

1) Bọc app của bạn:

  import ToastProvider from "./Toast";

  export default function Root() {
    return (
      <ToastProvider>
        <App />
      </ToastProvider>
    );
  }

2) Gọi toast ở bất kỳ function nào (thậm chí ngoài React components):

  import { toast } from "./Toast";

  async function onLogin() {
    try {
      // ... gọi API
    } catch (e) {
      toast.error("Sai mật khẩu. Vui lòng thử lại.");
      // hoặc đầy đủ hơn:
      // toast.show({ message: "Sai mật khẩu", title: "Đăng nhập thất bại", kind: "error", duration: 3000 });
    }
  }

3) Hoặc trong component bằng hook:

  import { useToast } from "./Toast";
  const { show } = useToast();
  show({ message: "Sai mật khẩu", kind: "error" });
---------------------------------- */
