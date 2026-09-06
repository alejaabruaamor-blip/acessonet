import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { QRCodeCanvas } from "qrcode.react";
import { createPixPayment, getPixStatus } from "@/lib/pix.functions";
import { trackEvent } from "@/lib/tracking";

const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type Props = {
  open: boolean;
  onClose: () => void;
  amount: number;
  title: string;
  /** Rota para onde o cliente vai após o pagamento ser confirmado. */
  nextRoute: string;
  /** Se preenchido, não pede nome/email e gera o Pix automaticamente ao abrir. */
  prefillName?: string;
  prefillEmail?: string;
};

type Pix = { id: string; qrCode: string };

export function PixCheckoutModal({
  open,
  onClose,
  amount,
  title,
  nextRoute,
  prefillName,
  prefillEmail,
}: Props) {
  const navigate = useNavigate();
  const createPix = useServerFn(createPixPayment);
  const checkStatus = useServerFn(getPixStatus);

  const skipForm = Boolean(prefillName && prefillEmail);
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [name, setName] = useState(prefillName ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<Pix | null>(null);
  const [copied, setCopied] = useState(false);
  const paidRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    if (skipForm && !pix && !loading && !error) {
      setLoading(true);
      createPix({ data: { amount, title, name, email } })
        .then((res) => {
          setPix({ id: res.id, qrCode: res.qrCode });
          trackEvent("AddPaymentInfo", { content_name: title, currency: "BRL", value: amount });
        })
        .catch((err) =>
          setError(err instanceof Error ? err.message : "Não foi possível gerar o Pix."),
        )
        .finally(() => setLoading(false));
    }
  }, [open, skipForm, pix, loading, error, createPix, amount, title, name, email]);

  useEffect(() => {
    if (!pix?.id) return;
    let timer: ReturnType<typeof setInterval>;
    const tick = async () => {
      try {
        const res = await checkStatus({ data: { id: pix.id } });
        if (res.status?.toUpperCase() === "PAID" && !paidRef.current) {
          paidRef.current = true;
          clearInterval(timer);
          trackEvent("Purchase", { content_name: title, currency: "BRL", value: amount });
          navigate({ to: nextRoute });
        }
      } catch {
        /* tenta de novo no próximo ciclo */
      }
    };
    void tick();
    timer = setInterval(tick, 1500);
    return () => clearInterval(timer);
  }, [pix?.id, checkStatus, navigate, nextRoute, amount, title]);

  if (!open) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createPix({ data: { amount, title, name, email } });
      setPix({ id: res.id, qrCode: res.qrCode });
      trackEvent("AddPaymentInfo", { content_name: title, currency: "BRL", value: amount });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o Pix.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!pix) return;
    await navigator.clipboard.writeText(pix.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4">
      <div className="mt-8 w-full max-w-md rounded-2xl bg-background p-6 shadow-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">
              Valor: <strong className="text-foreground">{brl(amount)}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="text-2xl leading-none text-muted-foreground"
          >
            ×
          </button>
        </div>

        {pix ? (
          <div className="mt-5 text-center">
            <p className="text-sm font-medium text-foreground">
              Escaneie o QR Code no seu banco para pagar
            </p>
            <div className="mt-4 flex justify-center">
              <div className="rounded-xl border border-border p-3">
                <QRCodeCanvas value={pix.qrCode} size={200} />
              </div>
            </div>
            <p className="mt-4 break-all rounded-lg border border-border bg-muted p-3 text-xs text-muted-foreground">
              {pix.qrCode}
            </p>
            <button
              type="button"
              onClick={copy}
              className="mt-4 w-full rounded-xl bg-rose-600 px-4 py-4 text-base font-bold text-white transition-opacity hover:opacity-90"
            >
              {copied ? "Código copiado!" : "Copiar código Pix"}
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              Assim que o pagamento for confirmado, você avança automaticamente.
            </p>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-5 space-y-3">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-rose-500"
            />
            <input
              type="text"
              required
              placeholder="Nome e sobrenome"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground outline-none focus:border-rose-500"
            />

            <div className="flex items-center gap-3 rounded-xl border-2 border-rose-500 bg-muted px-4 py-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-rose-500">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              </span>
              <span className="font-medium text-foreground">Pagamento via Pix</span>
              <span className="ml-auto text-sm text-emerald-600">Aprovação imediata.</span>
            </div>

            {error && (
              <p className="rounded-lg bg-rose-100 p-3 text-sm text-rose-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-rose-600 px-4 py-4 text-base font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
            >
              {loading ? "Gerando Pix..." : `Pagar ${brl(amount)}`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
