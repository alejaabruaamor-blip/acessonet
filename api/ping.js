export default function handler(req, res) {
  res.status(200).json({ ok: true, node: process.version, haspub: !!process.env.FREEPAY_PUBLIC_KEY, hassec: !!process.env.FREEPAY_SECRET_KEY });
}
