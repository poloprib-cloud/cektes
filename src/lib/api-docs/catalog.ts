import {
  ApiAuthScheme,
  ApiEndpointDoc,
  ApiEndpointGroup,
  ApiFaq,
  ApiHighlight,
  ApiLifecycleStage,
  ApiParamDoc,
  ApiQuickStartStep,
  HttpMethod,
} from "./types";

const publicBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "{{BASE_URL}}").replace(/\/$/, "");
const publicApiBaseUrl = `${publicBaseUrl}/api`;
const clientApiBaseUrl = `${publicApiBaseUrl}/client/v1`;

const acceptHeader: ApiParamDoc = {
  name: "Accept",
  type: "string",
  required: true,
  description: "Gunakan application/json agar backend selalu mengembalikan JSON.",
  example: "application/json",
};

const globalApiKeyHeader: ApiParamDoc = {
  name: "X-API-KEY",
  type: "string",
  required: true,
  description: "Global API access key yang diverifikasi oleh ApiKeyMiddleware untuk route /api non client.",
  example: "server-api-key",
};

const bearerHeader: ApiParamDoc = {
  name: "Authorization",
  type: "string",
  required: true,
  description: "Bearer token JWT hasil login untuk route akun dan transaksi user.",
  example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOi...",
};

const optionalBearerHeader: ApiParamDoc = {
  name: "Authorization",
  type: "string",
  required: false,
  description: "Bearer JWT opsional. Jika tidak ada, beberapa endpoint meminta identifier pemesan sebagai pengganti auth user.",
  example: "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOi...",
};

const clientKeyHeader: ApiParamDoc = {
  name: "X-API-KEY",
  type: "string",
  required: true,
  description: "API key credential per user dari /api/account/api-credential.",
  example: "tug_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
};

const clientTimestampHeader: ApiParamDoc = {
  name: "X-API-TIMESTAMP",
  type: "integer",
  required: true,
  description: "Unix timestamp detik. Toleransi replay default 300 detik.",
  example: "1710000000",
};

const clientNonceHeader: ApiParamDoc = {
  name: "X-API-NONCE",
  type: "string",
  required: true,
  description: "Nonce unik per request untuk replay protection.",
  example: "65d0e0d6-f0ff-4c12-b9b0-0f43d0f832f1",
};

const clientSignatureHeader: ApiParamDoc = {
  name: "X-API-SIGNATURE",
  type: "string",
  required: true,
  description: "HMAC SHA256 lowercase dari string to sign menggunakan secret_key credential user.",
  example: "9e7d8c6b...",
};

const idempotencyHeader: ApiParamDoc = {
  name: "Idempotency-Key",
  type: "string",
  required: true,
  description: "Kunci idempotensi untuk POST /api/client/v1/orders agar retry tidak membuat invoice ganda.",
  example: "partner-order-20260329-0001",
};

const tripaySignatureHeader: ApiParamDoc = {
  name: "X-Callback-Signature",
  type: "string",
  required: true,
  description: "HMAC SHA256 dari body callback Tripay menggunakan private key.",
  example: "e4f8f6...",
};

const tripayEventHeader: ApiParamDoc = {
  name: "X-Callback-Event",
  type: "string",
  required: true,
  description: "Backend hanya menerima nilai payment_status.",
  example: "payment_status",
};

const digiflazzEventHeader: ApiParamDoc = {
  name: "X-Digiflazz-Event",
  type: "string",
  required: false,
  description: "Jenis event webhook Digiflazz. Default internal fallback adalah update.",
  example: "update",
};

const digiflazzSignatureHeader: ApiParamDoc = {
  name: "X-Hub-Signature",
  type: "string",
  required: false,
  description: "sha1 HMAC raw body ketika digi.secret tersedia di setting backend.",
  example: "sha1=9f4d...",
};

const qrispySignatureHeader: ApiParamDoc = {
  name: "X-Qrispy-Signature",
  type: "string",
  required: true,
  description: "HMAC SHA256 raw body menggunakan qrispy.webhook_secret.",
  example: "1dfd4a...",
};

const publicHeaders = [acceptHeader, globalApiKeyHeader];
const jwtHeaders = [acceptHeader, globalApiKeyHeader, bearerHeader];
const reviewHeaders = [acceptHeader, globalApiKeyHeader, optionalBearerHeader];
const clientHeaders = [acceptHeader, clientKeyHeader, clientTimestampHeader, clientNonceHeader, clientSignatureHeader];
const clientOrderHeaders = [...clientHeaders, idempotencyHeader];

const json = (value: unknown) => JSON.stringify(value, null, 2);

const bashExample = (title: string, content: string) => ({
  title,
  language: "bash" as const,
  content,
});

const jsonExample = (title: string, value: unknown) => ({
  title,
  language: "json" as const,
  content: json(value),
});

const jsonError = (title: string, status: number, value: unknown) => ({
  title,
  status,
  content: json(value),
});

const statusCodes = (...items: Array<[number, string]>) => items.map(([code, description]) => ({ code, description }));

const makeId = (method: HttpMethod, path: string) =>
  `${method.toLowerCase()}-${path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;

const buildCurl = (method: HttpMethod, url: string, headers: string[], body?: unknown) => {
  const lines = [`curl -X ${method} '${url}'`, ...headers.map((header) => `  -H '${header}'`)];

  if (body !== undefined) {
    lines.push(`  -H 'Content-Type: application/json'`);
    lines.push(`  -d '${typeof body === "string" ? body : JSON.stringify(body)}'`);
  }

  return lines.join(" \\\n");
};

const curlPublic = (method: HttpMethod, path: string, body?: unknown) =>
  buildCurl(method, `${publicBaseUrl}${path}`, ["Accept: application/json", "X-API-KEY: <server-api-key>"], body);

const curlJwt = (method: HttpMethod, path: string, body?: unknown) =>
  buildCurl(method, `${publicBaseUrl}${path}`, ["Accept: application/json", "X-API-KEY: <server-api-key>", "Authorization: Bearer <jwt-token>"], body);

const curlClient = (method: HttpMethod, path: string, body?: unknown, withIdempotency = false) => {
  const headers = [
    "Accept: application/json",
    "X-API-KEY: <client-api-key>",
    "X-API-TIMESTAMP: <unix-timestamp>",
    "X-API-NONCE: <unique-nonce>",
    "X-API-SIGNATURE: <sha256-hmac-signature>",
  ];

  if (withIdempotency) {
    headers.push("Idempotency-Key: <unique-request-key>");
  }

  return buildCurl(method, `${publicBaseUrl}${path}`, headers, body);
};

const endpoint = (doc: Omit<ApiEndpointDoc, "id" | "fullPath"> & { fullPath?: string }): ApiEndpointDoc => ({
  id: makeId(doc.method, doc.path),
  fullPath: doc.fullPath ?? `${publicBaseUrl}${doc.path}`,
  ...doc,
});

const publicEndpoint = (doc: Omit<ApiEndpointDoc, "id" | "fullPath" | "auth" | "headers"> & { headers?: ApiParamDoc[] }) =>
  endpoint({ ...doc, auth: ["X-API-KEY"], headers: doc.headers ?? publicHeaders });

const jwtEndpoint = (doc: Omit<ApiEndpointDoc, "id" | "fullPath" | "auth" | "headers"> & { headers?: ApiParamDoc[] }) =>
  endpoint({ ...doc, auth: ["X-API-KEY", "Bearer JWT"], headers: doc.headers ?? jwtHeaders });

const clientEndpoint = (doc: Omit<ApiEndpointDoc, "id" | "fullPath" | "auth" | "headers"> & { headers?: ApiParamDoc[] }) =>
  endpoint({ ...doc, auth: ["Signed Client API v1"], headers: doc.headers ?? clientHeaders });

const callbackEndpoint = (doc: Omit<ApiEndpointDoc, "id" | "fullPath" | "auth">) =>
  endpoint({ ...doc, auth: ["Provider Callback"] });

const authEndpoints: ApiEndpointDoc[] = [
  publicEndpoint({
    method: "POST",
    path: "/api/auth/register",
    summary: "Registrasi akun baru.",
    description: "Membuat user basic baru setelah captcha Cloudflare Turnstile lolos dan email belum dipakai.",
    bodyFields: [
      { name: "name", type: "string", required: true, description: "Nama user.", example: "Ferdi Ananda" },
      { name: "email", type: "string", required: true, description: "Email user.", example: "ferdi@example.com" },
      { name: "password", type: "string", required: true, description: "Password minimal 6 karakter.", example: "rahasia123" },
      { name: "turnstile_token", type: "string", required: true, description: "Token captcha Turnstile.", example: "cf-turnstile-token" },
    ],
    statusCodes: statusCodes([200, "Registrasi berhasil"], [422, "Captcha gagal atau data tidak valid"]),
    requestExample: bashExample("Contoh request", curlPublic("POST", "/api/auth/register", { name: "Ferdi Ananda", email: "ferdi@example.com", password: "rahasia123", turnstile_token: "cf-turnstile-token" })),
    successExample: jsonExample("Response sukses", { success: true, message: "Register berhasil", user: { id: 17, email: "ferdi@example.com", name: "Ferdi Ananda", role: "basic" } }),
    errorExamples: [
      jsonError("Captcha gagal", 422, { success: false, message: "Verifikasi captcha gagal" }),
      jsonError("Duplikat email", 422, { success: false, message: "Akun Dengan Email/WhatsApp Tersebut Sudah Terdaftar, Silahkan Masuk Dengan Email Tersebut." }),
    ],
  }),
  publicEndpoint({
    method: "POST",
    path: "/api/auth/login",
    summary: "Login email dan password.",
    description: "Memvalidasi captcha, memeriksa kredensial user, lalu mengembalikan JWT untuk route akun dan transaksi.",
    bodyFields: [
      { name: "email", type: "string", required: true, description: "Email akun.", example: "ferdi@example.com" },
      { name: "password", type: "string", required: true, description: "Password akun.", example: "rahasia123" },
      { name: "turnstile_token", type: "string", required: true, description: "Token captcha Turnstile.", example: "cf-turnstile-token" },
    ],
    statusCodes: statusCodes([200, "Login berhasil"], [401, "Email atau password salah"], [422, "Captcha gagal atau data tidak valid"]),
    requestExample: bashExample("Contoh request", curlPublic("POST", "/api/auth/login", { email: "ferdi@example.com", password: "rahasia123", turnstile_token: "cf-turnstile-token" })),
    successExample: jsonExample("Response sukses", { success: true, message: "Login berhasil", token: "eyJ0eXAiOiJKV1QiLCJhbGciOi...", user: { id: 17, email: "ferdi@example.com", name: "Ferdi Ananda", role: "basic", whatsapp: "6281234567890" } }),
    errorExamples: [
      jsonError("Kredensial salah", 401, { success: false, message: "Email atau password salah" }),
      jsonError("Data tidak valid", 422, { success: false, message: "Data tidak valid", errors: { email: ["The email field is required."] } }),
    ],
  }),
  publicEndpoint({
    method: "POST",
    path: "/api/auth/google",
    summary: "Login memakai Google ID token.",
    description: "Memverifikasi id_token ke Google tokeninfo, memastikan audience cocok, lalu login atau membuat user basic baru.",
    bodyFields: [
      { name: "id_token", type: "string", required: true, description: "Google ID token dari client OAuth flow.", example: "eyJhbGciOiJSUzI1NiIsImtpZCI6..." },
      { name: "name", type: "string", required: false, description: "Nama fallback bila payload Google tidak menyertakan name.", example: "Ferdi Ananda" },
    ],
    statusCodes: statusCodes([200, "Login berhasil"], [401, "Token Google tidak valid"], [422, "Payload tidak valid"], [500, "Google client ID belum dikonfigurasi"]),
    requestExample: bashExample("Contoh request", curlPublic("POST", "/api/auth/google", { id_token: "google-id-token", name: "Ferdi Ananda" })),
    successExample: jsonExample("Response sukses", { success: true, message: "Login berhasil", token: "eyJ0eXAiOiJKV1QiLCJhbGciOi...", user: { id: 17, email: "ferdi@example.com", name: "Ferdi Ananda", role: "basic", whatsapp: null } }),
    errorExamples: [
      jsonError("Token Google tidak valid", 401, { success: false, message: "Token Google tidak valid" }),
      jsonError("Konfigurasi belum ada", 500, { success: false, message: "Google Client ID belum dikonfigurasi" }),
    ],
  }),
  publicEndpoint({
    method: "POST",
    path: "/api/auth/otp/request",
    summary: "Minta OTP WhatsApp.",
    description: "Mendukung purpose register, login, dan reset_password. Backend menerapkan cooldown, expiry, dan max attempt dari setting OTP.",
    bodyFields: [
      { name: "whatsapp", type: "string", required: true, description: "Nomor WhatsApp user.", example: "081234567890" },
      { name: "purpose", type: "string", required: true, description: "register, login, atau reset_password.", example: "login" },
      { name: "turnstile_token", type: "string", required: true, description: "Token captcha Turnstile.", example: "cf-turnstile-token" },
    ],
    notes: [
      "Untuk purpose register backend menolak nomor WhatsApp yang sudah dipakai user lain.",
      "Untuk purpose login dan reset_password backend akan mengembalikan 404 jika akun belum terdaftar.",
    ],
    statusCodes: statusCodes([200, "OTP berhasil dikirim"], [404, "Akun belum terdaftar"], [422, "Captcha atau nomor tidak valid"], [429, "Cooldown aktif"]),
    requestExample: bashExample("Contoh request", curlPublic("POST", "/api/auth/otp/request", { whatsapp: "081234567890", purpose: "login", turnstile_token: "cf-turnstile-token" })),
    successExample: jsonExample("Response sukses", { success: true, message: "OTP berhasil dikirim", meta: { cooldown_seconds: 60, expiry_minutes: 5 } }),
    errorExamples: [
      jsonError("Akun belum terdaftar", 404, { success: false, message: "Akun belum terdaftar, silakan daftar terlebih dahulu" }),
      jsonError("Rate limit OTP", 429, { success: false, message: "Terlalu banyak percobaan, coba lagi nanti", meta: { cooldown_seconds: 60 } }),
    ],
  }),
  publicEndpoint({
    method: "POST",
    path: "/api/auth/otp/verify",
    summary: "Verifikasi OTP WhatsApp.",
    description: "Memverifikasi kode OTP dan mengembalikan JWT untuk alur login atau register. Untuk reset password backend mengembalikan token reset.",
    bodyFields: [
      { name: "whatsapp", type: "string", required: true, description: "Nomor yang menerima OTP.", example: "081234567890" },
      { name: "otp", type: "string", required: true, description: "Kode OTP.", example: "123456" },
      { name: "purpose", type: "string", required: true, description: "Purpose yang sama dengan request OTP.", example: "login" },
      { name: "name", type: "string", required: false, description: "Nama user saat register via OTP.", example: "Ferdi Ananda" },
    ],
    statusCodes: statusCodes([200, "OTP valid"], [422, "OTP salah, expired, atau payload tidak valid"]),
    requestExample: bashExample("Contoh request", curlPublic("POST", "/api/auth/otp/verify", { whatsapp: "081234567890", otp: "123456", purpose: "login" })),
    successExample: jsonExample("Response sukses", { success: true, message: "Login berhasil", token: "eyJ0eXAiOiJKV1QiLCJhbGciOi...", user: { whatsapp: "6281234567890", role: "basic" } }),
    errorExamples: [
      jsonError("OTP tidak valid", 422, { success: false, message: "OTP tidak valid atau sudah kadaluarsa" }),
    ],
  }),
  jwtEndpoint({
    method: "GET",
    path: "/api/auth/user",
    summary: "Ambil user dari JWT aktif.",
    description: "Closure route sederhana untuk mengecek user hasil auth middleware jwt.auth.",
    statusCodes: statusCodes([200, "User JWT berhasil dibaca"], [401, "JWT tidak valid"]),
    requestExample: bashExample("Contoh request", curlJwt("GET", "/api/auth/user")),
    successExample: jsonExample("Response sukses", { user: { id: 17, name: "Ferdi Ananda", email: "ferdi@example.com", role: "basic" } }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
];

const publicCatalogEndpoints: ApiEndpointDoc[] = [
  publicEndpoint({
    method: "GET",
    path: "/api/settings",
    summary: "Ambil konfigurasi publik website.",
    description: "Mengembalikan whitelist setting publik seperti brand, SEO, social links, theme, Turnstile, dan toggle fitur tertentu.",
    statusCodes: statusCodes([200, "Konfigurasi publik berhasil dibaca"], [401, "X-API-KEY tidak valid"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/settings")),
    successExample: jsonExample("Response sukses", { success: true, data: { "general.title": "Top Up Games", "turnstile.enabled": true, "theme.default_mode": "light" } }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/sitemap",
    summary: "Katalog URL untuk sitemap frontend.",
    description: "Menggabungkan static path, game aktif, blog published, custom page published, dan custom URL dari setting sitemap.",
    statusCodes: statusCodes([200, "Daftar sitemap berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/sitemap")),
    successExample: jsonExample("Response sukses", { success: true, data: { urls: [{ loc: "/", lastmod: "2026-03-29T12:00:00+07:00" }, { loc: "/order/mobile-legends", lastmod: "2026-03-28T20:00:00+07:00" }] } }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/sliders",
    summary: "Daftar slider homepage.",
    description: "Mengembalikan data slider yang sudah disanitasi ke URL storage publik.",
    statusCodes: statusCodes([200, "Slider berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/sliders")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ id: 1, images: `${publicBaseUrl}/storage/sliders/hero.webp`, title: "Promo Ramadan" }] }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/category",
    summary: "Daftar kategori game.",
    description: "Kategori diurutkan berdasarkan sort lalu dipakai sebagai navigasi katalog publik.",
    statusCodes: statusCodes([200, "Kategori berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/category")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ id: 1, title: "MOBA", sort: 1 }, { id: 2, title: "Shooter", sort: 2 }] }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/price-list",
    summary: "Daftar harga publik lintas game.",
    description: "Mengembalikan grouping per game dengan daftar produk dan harga regular, gold, serta platinum.",
    statusCodes: statusCodes([200, "Price list berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/price-list")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ id: 11, game_name: "Mobile Legends", brand: "MLBB", slug: "mobile-legends", products: [{ id: 901, title: "86 Diamond", selling_price: 20000, selling_price_gold: 19000, selling_price_platinum: 18000 }] }] }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/popup-promo",
    summary: "Promo aktif untuk popup.",
    description: "Mengembalikan satu promo aktif terbaru yang masih dalam window start_at dan end_at.",
    statusCodes: statusCodes([200, "Promo popup berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/popup-promo")),
    successExample: jsonExample("Response sukses", { success: true, promo: { id: 5, title: "Flash Sale", description: "Diskon weekend", image_url: `${publicBaseUrl}/storage/promo/flash-sale.webp`, link: "/promo/weekend", is_active: true } }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/games",
    summary: "Daftar game publik.",
    description: "Mengembalikan seluruh game beserta kategori, image, banner, dan daftar populer terpisah di key populerGames.",
    statusCodes: statusCodes([200, "Game berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/games")),
    successExample: jsonExample("Response sukses", { success: true, games: [{ id: 11, title: "Mobile Legends", slug: "mobile-legends", brand: "MLBB", category: { id: 1, title: "MOBA" } }], populerGames: [{ id: 11, title: "Mobile Legends", slug: "mobile-legends" }] }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/games/{slug}",
    summary: "Detail game publik berdasarkan slug.",
    description: "Menampilkan detail satu game publik lengkap dengan category, image, banner, dan produk terkait.",
    pathParams: [{ name: "slug", type: "string", required: true, description: "Slug game.", example: "mobile-legends" }],
    statusCodes: statusCodes([200, "Game ditemukan"], [404, "Game tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/games/mobile-legends")),
    successExample: jsonExample("Response sukses", { success: true, data: { id: 11, title: "Mobile Legends", slug: "mobile-legends", brand: "MLBB", status: true } }),
    errorExamples: [jsonError("Game tidak ditemukan", 404, { success: false, message: "Game tidak ditemukan." })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/blogs",
    summary: "Daftar artikel blog lengkap.",
    description: "Mengembalikan list artikel published lengkap dengan content penuh dan kategori blog.",
    statusCodes: statusCodes([200, "Blog berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/blogs")),
    successExample: jsonExample("Response sukses", { success: true, blogs: [{ id: 101, title: "Promo Ramadan", slug: "promo-ramadan", published_at: "2026-03-29T09:00:00+07:00", category: { id: 3, title: "Promo", slug: "promo" } }] }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/blogs-lite",
    summary: "Daftar artikel blog versi ringan.",
    description: "Versi paginated dengan excerpt, cocok untuk halaman listing artikel frontend.",
    queryParams: [
      { name: "page", type: "integer", required: false, description: "Nomor halaman.", example: "1" },
      { name: "per_page", type: "integer", required: false, description: "Jumlah item per halaman, maksimal 50.", example: "9" },
    ],
    statusCodes: statusCodes([200, "Blog lite berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/blogs-lite?page=1&per_page=9")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ id: 101, title: "Promo Ramadan", slug: "promo-ramadan", excerpt: "Ringkasan artikel..." }], meta: { current_page: 1, per_page: 9, total: 34, last_page: 4 } }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/blogs/{slug}",
    summary: "Detail satu artikel blog.",
    description: "Mengambil artikel berdasarkan slug, lalu menambah views di backend.",
    pathParams: [{ name: "slug", type: "string", required: true, description: "Slug artikel blog.", example: "promo-ramadan" }],
    statusCodes: statusCodes([200, "Artikel ditemukan"], [404, "Artikel tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/blogs/promo-ramadan")),
    successExample: jsonExample("Response sukses", { success: true, blog: { id: 101, title: "Promo Ramadan", slug: "promo-ramadan", views: 123, category: { id: 3, title: "Promo", slug: "promo" } } }),
    errorExamples: [jsonError("Artikel tidak ditemukan", 404, { message: "No query results for model [App\\Models\\Blog]." })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/pages/{slug}",
    summary: "Custom page published berdasarkan slug.",
    description: "Mengembalikan halaman statis published dari tabel custom_pages.",
    pathParams: [{ name: "slug", type: "string", required: true, description: "Slug halaman.", example: "tentang-kami" }],
    statusCodes: statusCodes([200, "Halaman ditemukan"], [404, "Halaman tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/pages/tentang-kami")),
    successExample: jsonExample("Response sukses", { success: true, page: { id: 7, title: "Tentang Kami", slug: "tentang-kami", content: "<p>Company profile...</p>" } }),
    errorExamples: [jsonError("Halaman tidak ditemukan", 404, { message: "No query results for model [App\\Models\\CustomPage]." })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/promo",
    summary: "Daftar produk yang sedang promo.",
    description: "Produk difilter lewat relasi activePromotion dan dikembalikan bersama informasi game serta periode promo.",
    statusCodes: statusCodes([200, "Produk promo berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/promo")),
    successExample: jsonExample("Response sukses", { success: true, products: [{ id: 901, code: "ML86", title: "86 Diamond", brand: "MLBB", promo_price: 18000, is_promo: true, game_slug: "mobile-legends" }] }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "POST",
    path: "/api/promo/validate",
    summary: "Validasi promo code untuk flow order publik.",
    description: "Mengembalikan promo dan pricing hasil validasi terhadap game, product, payment method, role, dan WhatsApp.",
    bodyFields: [
      { name: "code", type: "string", required: true, description: "Kode promo.", example: "RAMADAN10" },
      { name: "game_slug", type: "string", required: true, description: "Slug game.", example: "mobile-legends" },
      { name: "product_id", type: "integer", required: true, description: "ID produk.", example: "901" },
      { name: "payment_method_id", type: "integer", required: true, description: "ID metode pembayaran.", example: "12" },
      { name: "whatsapp", type: "string", required: false, description: "Nomor untuk kebutuhan usage limit per user tanpa login.", example: "6281234567890" },
    ],
    statusCodes: statusCodes([200, "Promo valid"], [422, "Promo tidak valid"]),
    requestExample: bashExample("Contoh request", curlPublic("POST", "/api/promo/validate", { code: "RAMADAN10", game_slug: "mobile-legends", product_id: 901, payment_method_id: 12, whatsapp: "6281234567890" })),
    successExample: jsonExample("Response sukses", { success: true, message: "Kode promo dapat digunakan.", data: { promo: { code: "RAMADAN10", discount_type: "PERCENT", discount_value: 10 }, pricing: { base_price: 20000, discount: 2000, final_price: 18000 } } }),
    errorExamples: [jsonError("Promo tidak valid", 422, { success: false, message: "Kode promo tidak berlaku untuk metode pembayaran ini." })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/promo-codes",
    summary: "List promo code untuk popup atau hint UI.",
    description: "Backend mengembalikan status aktif, eligibility, alasan ineligible, dan debug input yang sudah di-resolve.",
    queryParams: [
      { name: "game_slug", type: "string", required: false, description: "Slug game. Alias game juga diterima.", example: "mobile-legends" },
      { name: "product_id", type: "integer", required: false, description: "ID produk.", example: "901" },
      { name: "payment_method_id", type: "integer", required: false, description: "ID metode pembayaran.", example: "12" },
    ],
    statusCodes: statusCodes([200, "Daftar promo code berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/promo-codes?game_slug=mobile-legends&product_id=901&payment_method_id=12")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ id: 44, code: "RAMADAN10", status: "ACTIVE", is_eligible: true, ineligible_reasons: [], discount_type: "PERCENT", discount_value: 10 }] }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "POST",
    path: "/api/promo-codes/validate",
    summary: "Validasi promo code versi dedicated service.",
    description: "Endpoint ini memakai PromoCodeValidateRequest dan mengembalikan seluruh hasil validatePromo termasuk pricing akhir.",
    bodyFields: [
      { name: "code", type: "string", required: true, description: "Kode promo.", example: "RAMADAN10" },
      { name: "game_slug", type: "string", required: true, description: "Slug game. Alias game juga diterima.", example: "mobile-legends" },
      { name: "product_id", type: "integer", required: true, description: "ID produk.", example: "901" },
      { name: "payment_method_id", type: "integer", required: true, description: "ID metode pembayaran.", example: "12" },
      { name: "whatsapp", type: "string", required: false, description: "Nomor pemesan untuk usage limit tanpa login.", example: "6281234567890" },
    ],
    statusCodes: statusCodes([200, "Promo valid"], [422, "Promo tidak valid atau payload gagal validasi"]),
    requestExample: bashExample("Contoh request", curlPublic("POST", "/api/promo-codes/validate", { code: "RAMADAN10", game_slug: "mobile-legends", product_id: 901, payment_method_id: 12, whatsapp: "6281234567890" })),
    successExample: jsonExample("Response sukses", { success: true, message: "Kode promo dapat digunakan.", data: { valid: true, promo: { code: "RAMADAN10" }, pricing: { base_price: 20000, discount: 2000, final_price: 18000 } } }),
    errorExamples: [jsonError("Promo tidak valid", 422, { success: false, message: "Kode promo tidak ditemukan." })],
  }),
];

const legacyCommerceEndpoints: ApiEndpointDoc[] = [
  publicEndpoint({
    method: "GET",
    path: "/api/order/{slug}",
    summary: "Konfigurasi order publik berdasarkan game.",
    description: "Mengembalikan detail game dan seluruh payment method aktif untuk menyusun checkout publik.",
    pathParams: [{ name: "slug", type: "string", required: true, description: "Slug game.", example: "mobile-legends" }],
    statusCodes: statusCodes([200, "Konfigurasi order berhasil dibaca"], [404, "Game tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/order/mobile-legends")),
    successExample: jsonExample("Response sukses", { success: true, game: { id: 11, title: "Mobile Legends", slug: "mobile-legends" }, paymentMethods: [{ id: 12, name: "QRIS", code: "QRIS", provider: "qrispy" }] }),
    errorExamples: [jsonError("Game tidak ditemukan", 404, { success: false, message: "Game tidak ditemukan." })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/order-config/{slug}",
    summary: "Alias legacy dari konfigurasi order publik.",
    description: "Route ini memanggil controller yang sama dengan GET /api/order/{slug}. Gunakan hanya bila frontend lama masih bergantung pada path alias ini.",
    pathParams: [{ name: "slug", type: "string", required: true, description: "Slug game.", example: "mobile-legends" }],
    notes: ["Route ini identik dengan GET /api/order/{slug}. Backend mengarah ke method yang sama."],
    statusCodes: statusCodes([200, "Konfigurasi order berhasil dibaca"], [404, "Game tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/order-config/mobile-legends")),
    successExample: jsonExample("Response sukses", { success: true, game: { slug: "mobile-legends" }, paymentMethods: [{ id: 12, name: "QRIS" }] }),
    errorExamples: [jsonError("Game tidak ditemukan", 404, { success: false, message: "Game tidak ditemukan." })],
  }),
  publicEndpoint({
    method: "POST",
    path: "/api/order",
    summary: "Buat order publik.",
    description: "Membuat invoice pembayaran, menghitung harga akhir, fee payment method, promo code, lalu menyimpan order dengan status awal UNPAID dan Pending.",
    bodyFields: [
      { name: "id", type: "string", required: true, description: "User ID / game ID target transaksi.", example: "12345678" },
      { name: "server", type: "string", required: false, description: "Server ID bila game memerlukannya.", example: "2012" },
      { name: "game", type: "string", required: true, description: "Slug game aktif.", example: "mobile-legends" },
      { name: "product_id", type: "integer", required: true, description: "ID produk.", example: "901" },
      { name: "payment_method_id", type: "integer", required: true, description: "ID metode pembayaran.", example: "12" },
      { name: "email", type: "string", required: false, description: "Email pemesan.", example: "ferdi@example.com" },
      { name: "whatsapp", type: "string", required: true, description: "Nomor WhatsApp pemesan.", example: "081234567890" },
      { name: "nickname", type: "string", required: false, description: "Nickname in-game.", example: "FerdiML" },
      { name: "promo_code", type: "string", required: false, description: "Promo code.", example: "RAMADAN10" },
      { name: "quantity", type: "integer", required: false, description: "Jumlah item, default 1.", example: "2" },
    ],
    statusCodes: statusCodes([201, "Pesanan berhasil dibuat"], [404, "Game, produk, atau payment method tidak ditemukan"], [422, "Brand mismatch atau validasi gagal"], [500, "Gagal membuat transaksi atau menyimpan order"]),
    requestExample: bashExample("Contoh request", curlPublic("POST", "/api/order", { id: "12345678", server: "2012", game: "mobile-legends", product_id: 901, payment_method_id: 12, email: "ferdi@example.com", whatsapp: "081234567890", nickname: "FerdiML", promo_code: "RAMADAN10", quantity: 2 })),
    successExample: jsonExample("Response sukses", { success: true, message: "Pesanan berhasil dibuat.", orderId: "INV-20260329093000-ABCDEFGH", data: { order_id: "INV-20260329093000-ABCDEFGH", payment_status: "UNPAID", buy_status: "Pending", payment_url: "https://gateway.example/pay/INV-20260329093000-ABCDEFGH", payment_code: "1234567890", payment_reference: "INV-20260329093000-ABCDEFGH", qr_url: null, expired_at: "2026-03-29T10:00:00+07:00", quantity: 2, total_price: 40000 } }),
    errorExamples: [
      jsonError("Produk tidak sesuai game", 422, { success: false, message: "Produk tidak sesuai dengan game yang dipilih." }),
      jsonError("Metode pembayaran tidak ditemukan", 404, { success: false, message: "Metode pembayaran tidak ditemukan." }),
    ],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/invoice/{order_id}",
    summary: "Detail invoice order.",
    description: "Mengembalikan order lengkap, plus mapping game dan product. Backend juga bisa menandai invoice UNPAID menjadi EXPIRED jika waktu habis.",
    pathParams: [{ name: "order_id", type: "string", required: true, description: "Order ID invoice.", example: "INV-20260329093000-ABCDEFGH" }],
    statusCodes: statusCodes([200, "Invoice berhasil dibaca"], [404, "Invoice tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/invoice/INV-20260329093000-ABCDEFGH")),
    successExample: jsonExample("Response sukses", { success: true, order: { order_id: "INV-20260329093000-ABCDEFGH", payment_status: "PAID", buy_status: "Sukses" }, game: { slug: "mobile-legends" }, product: { code: "ML86", title: "86 Diamond" } }),
    errorExamples: [jsonError("Invoice tidak ditemukan", 404, { success: false, message: "Invoice tidak ditemukan." })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/invoice/{order_id}/payment-status",
    summary: "Status ringan invoice.",
    description: "Polling status invoice. Backend dapat mengecek gateway DompetX atau Qrispy, lalu memperbarui payment_status dan buy_status bila ada perubahan.",
    pathParams: [{ name: "order_id", type: "string", required: true, description: "Order ID invoice.", example: "INV-20260329093000-ABCDEFGH" }],
    statusCodes: statusCodes([200, "Status berhasil dibaca"], [404, "Invoice tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/invoice/INV-20260329093000-ABCDEFGH/payment-status")),
    successExample: jsonExample("Response sukses", { success: true, data: { order_id: "INV-20260329093000-ABCDEFGH", payment_status: "PAID", buy_status: "Sukses", expired_time: 1711699200 } }),
    errorExamples: [jsonError("Invoice tidak ditemukan", 404, { success: false, message: "Invoice tidak ditemukan." })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/invoice/{order_id}/review",
    summary: "Ambil review untuk invoice tertentu.",
    description: "Mengembalikan review yang sudah pernah tersimpan untuk order tersebut, atau null bila belum ada.",
    pathParams: [{ name: "order_id", type: "string", required: true, description: "Order ID invoice.", example: "INV-20260329093000-ABCDEFGH" }],
    statusCodes: statusCodes([200, "Review berhasil dibaca"], [404, "Invoice tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/invoice/INV-20260329093000-ABCDEFGH/review")),
    successExample: jsonExample("Response sukses", { success: true, review: { rating: 5, review_text: "Top up cepat dan aman", created_at: "2026-03-29T10:15:00+07:00" } }),
    errorExamples: [jsonError("Invoice tidak ditemukan", 404, { success: false, message: "Invoice tidak ditemukan." })],
  }),
  publicEndpoint({
    method: "POST",
    path: "/api/invoice/{order_id}/review",
    summary: "Buat atau update review invoice.",
    description: "Review hanya bisa dibuat untuk order dengan buy_status Sukses. Jika user tidak login, backend akan meminta identifier pemesan yang cocok dengan email atau WhatsApp order.",
    headers: reviewHeaders,
    pathParams: [{ name: "order_id", type: "string", required: true, description: "Order ID invoice.", example: "INV-20260329093000-ABCDEFGH" }],
    bodyFields: [
      { name: "rating", type: "integer", required: true, description: "Nilai 1 sampai 5.", example: "5" },
      { name: "review_text", type: "string", required: true, description: "Isi ulasan.", example: "Top up cepat dan aman" },
      { name: "identifier", type: "string", required: false, description: "Email atau WhatsApp pemesan jika tidak mengirim JWT.", example: "ferdi@example.com" },
    ],
    notes: [
      "Throttle endpoint ini adalah 5 request per menit per IP.",
      "Jika review sudah ada dan reviewer_value berbeda, backend mengembalikan 403.",
    ],
    statusCodes: statusCodes([200, "Review berhasil disimpan"], [403, "Identifier atau owner tidak cocok"], [404, "Invoice tidak ditemukan"], [422, "Order belum sukses atau payload tidak valid"]),
    requestExample: bashExample("Contoh request", curlPublic("POST", "/api/invoice/INV-20260329093000-ABCDEFGH/review", { rating: 5, review_text: "Top up cepat dan aman", identifier: "ferdi@example.com" })),
    successExample: jsonExample("Response sukses", { success: true, message: "Ulasan berhasil dikirim.", review: { rating: 5, review_text: "Top up cepat dan aman" } }),
    errorExamples: [
      jsonError("Order belum sukses", 422, { success: false, message: "Ulasan hanya bisa dibuat untuk pesanan yang sudah sukses." }),
      jsonError("Identitas tidak cocok", 403, { success: false, message: "Identitas pemesan tidak sesuai." }),
    ],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/reviews",
    summary: "Daftar review publik.",
    description: "Review dipaginasi dan dirapikan lewat toPublicPayload pada model ProductReview.",
    queryParams: [{ name: "per_page", type: "integer", required: false, description: "Jumlah item per halaman, default 12, maksimal 50.", example: "12" }],
    statusCodes: statusCodes([200, "Review publik berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/reviews?per_page=12")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ rating: 5, review_text: "Top up cepat dan aman" }], meta: { current_page: 1, last_page: 3, per_page: 12, total: 30 } }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/invoices/search",
    summary: "Cari satu invoice berdasarkan order_id.",
    description: "Dipakai frontend untuk halaman pencarian invoice cepat.",
    queryParams: [{ name: "order_id", type: "string", required: true, description: "Nomor invoice.", example: "INV-20260329093000-ABCDEFGH" }],
    statusCodes: statusCodes([200, "Invoice ditemukan"], [404, "Invoice tidak ditemukan"], [422, "order_id kosong"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/invoices/search?order_id=INV-20260329093000-ABCDEFGH")),
    successExample: jsonExample("Response sukses", { success: true, data: { order_id: "INV-20260329093000-ABCDEFGH", payment_status: "PAID", buy_status: "Sukses" } }),
    errorExamples: [
      jsonError("order_id kosong", 422, { success: false, message: "Nomor invoice tidak boleh kosong." }),
      jsonError("Invoice tidak ditemukan", 404, { success: false, message: "Invoice tidak ditemukan." }),
    ],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/invoices/search-by-whatsapp",
    summary: "Cari seluruh order berdasarkan WhatsApp.",
    description: "Nomor WhatsApp dinormalisasi ke format 62xxxxxxxxxx sebelum query order dilakukan.",
    queryParams: [{ name: "whatsapp", type: "string", required: true, description: "Nomor WhatsApp pemesan.", example: "081234567890" }],
    statusCodes: statusCodes([200, "Daftar order ditemukan"], [404, "Order tidak ditemukan"], [422, "Nomor kosong atau tidak valid"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/invoices/search-by-whatsapp?whatsapp=081234567890")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ order_id: "INV-20260329093000-ABCDEFGH", payment_status: "PAID", buy_status: "Sukses" }] }),
    errorExamples: [
      jsonError("Nomor kosong", 422, { success: false, message: "Nomor WhatsApp tidak boleh kosong." }),
      jsonError("Tidak ditemukan", 404, { success: false, message: "Data order dengan nomor WhatsApp tersebut tidak ditemukan." }),
    ],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/realtime-transaction",
    summary: "10 transaksi terbaru.",
    description: "Mengembalikan 10 order terbaru untuk widget realtime transaction atau ticker live sales.",
    statusCodes: statusCodes([200, "Transaksi realtime berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/realtime-transaction")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ order_id: "INV-20260329093000-ABCDEFGH", games: "Mobile Legends", payment_status: "PAID", buy_status: "Sukses" }] }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/transactions/realtime",
    summary: "Alias transaksi realtime.",
    description: "Alias legacy ke controller realtime transaction yang sama dengan GET /api/realtime-transaction.",
    notes: ["Route ini mengarah ke method InvoiceController::realtimeTransaction yang sama persis dengan /api/realtime-transaction."],
    statusCodes: statusCodes([200, "Transaksi realtime berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlPublic("GET", "/api/transactions/realtime")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ order_id: "INV-20260329093000-ABCDEFGH", payment_status: "PAID", buy_status: "Sukses" }] }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
];

const accountEndpoints: ApiEndpointDoc[] = [
  jwtEndpoint({
    method: "GET",
    path: "/api/account/me",
    summary: "Profil user aktif.",
    description: "Mengembalikan profil user plus login_method hasil inferensi dari login history terakhir.",
    statusCodes: statusCodes([200, "Profil berhasil dibaca"], [401, "JWT tidak valid"]),
    requestExample: bashExample("Contoh request", curlJwt("GET", "/api/account/me")),
    successExample: jsonExample("Response sukses", { success: true, data: { id: 17, name: "Ferdi Ananda", email: "ferdi@example.com", whatsapp: "6281234567890", role: "basic", login_method: "email", login_provider: "credentials" } }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  jwtEndpoint({
    method: "PUT",
    path: "/api/account/profile",
    summary: "Update nama profil.",
    description: "Saat ini backend hanya menerima field name dan menerapkan throttle 20 request per menit.",
    bodyFields: [{ name: "name", type: "string", required: true, description: "Nama user, minimal 2 karakter.", example: "Ferdi Ananda" }],
    notes: ["Endpoint ini dibatasi throttle 20 request per menit per user/IP."],
    statusCodes: statusCodes([200, "Profil berhasil diperbarui"], [422, "Payload tidak valid"]),
    requestExample: bashExample("Contoh request", curlJwt("PUT", "/api/account/profile", { name: "Ferdi Ananda" })),
    successExample: jsonExample("Response sukses", { success: true, message: "Profil berhasil diperbarui", data: { id: 17, name: "Ferdi Ananda", email: "ferdi@example.com", whatsapp: "6281234567890", role: "basic" } }),
    errorExamples: [jsonError("Validasi gagal", 422, { message: "The name field is required.", errors: { name: ["The name field is required."] } })],
  }),
  jwtEndpoint({
    method: "PUT",
    path: "/api/account/password",
    summary: "Ganti password akun.",
    description: "Tidak berlaku untuk akun WhatsApp only. Backend memeriksa old_password, password, dan password_confirmation.",
    bodyFields: [
      { name: "old_password", type: "string", required: true, description: "Password lama.", example: "rahasia123" },
      { name: "password", type: "string", required: true, description: "Password baru.", example: "rahasiaBaru123" },
      { name: "password_confirmation", type: "string", required: true, description: "Konfirmasi password baru.", example: "rahasiaBaru123" },
    ],
    notes: ["Endpoint ini dibatasi throttle 5 request per menit per user/IP."],
    statusCodes: statusCodes([200, "Password berhasil diperbarui"], [422, "Akun WhatsApp tidak bisa ganti password atau password lama salah"]),
    requestExample: bashExample("Contoh request", curlJwt("PUT", "/api/account/password", { old_password: "rahasia123", password: "rahasiaBaru123", password_confirmation: "rahasiaBaru123" })),
    successExample: jsonExample("Response sukses", { success: true, message: "Password berhasil diperbarui" }),
    errorExamples: [
      jsonError("Password lama salah", 422, { success: false, message: "Password lama tidak sesuai" }),
      jsonError("Akun WhatsApp", 422, { success: false, message: "Akun WhatsApp tidak bisa mengubah password" }),
    ],
  }),
  jwtEndpoint({
    method: "GET",
    path: "/api/transactions",
    summary: "Daftar transaksi user.",
    description: "Query berdasarkan user_id atau WhatsApp milik user aktif. Mendukung pencarian order_id dan pagination.",
    queryParams: [
      { name: "q", type: "string", required: false, description: "Pencarian order_id.", example: "INV-20260329" },
      { name: "per_page", type: "integer", required: false, description: "Jumlah item per halaman, maksimal 100.", example: "10" },
    ],
    statusCodes: statusCodes([200, "Transaksi user berhasil dibaca"], [401, "JWT tidak valid"]),
    requestExample: bashExample("Contoh request", curlJwt("GET", "/api/transactions?q=INV-20260329&per_page=10")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ order_id: "INV-20260329093000-ABCDEFGH", amount: 40000, payment_status: "PAID", buy_status: "Sukses", status: "Sukses" }], meta: { current_page: 1, per_page: 10, total: 12, last_page: 2 } }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  jwtEndpoint({
    method: "GET",
    path: "/api/transactions/transaction-summary",
    summary: "Ringkasan transaksi user.",
    description: "Mengembalikan total, paid, unpaid, failed, expired, dan failed_expired dari transaksi user aktif.",
    statusCodes: statusCodes([200, "Ringkasan transaksi berhasil dibaca"], [401, "JWT tidak valid"]),
    requestExample: bashExample("Contoh request", curlJwt("GET", "/api/transactions/transaction-summary")),
    successExample: jsonExample("Response sukses", { success: true, data: { total: 30, paid: 22, unpaid: 3, failed: 2, expired: 3, failed_expired: 5 } }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  jwtEndpoint({
    method: "GET",
    path: "/api/transactions/{order_id}",
    summary: "Detail transaksi user berdasarkan order_id.",
    description: "Route ini hanya mengembalikan transaksi yang memang dimiliki user aktif melalui user_id atau WhatsApp.",
    pathParams: [{ name: "order_id", type: "string", required: true, description: "Order ID transaksi.", example: "INV-20260329093000-ABCDEFGH" }],
    statusCodes: statusCodes([200, "Transaksi ditemukan"], [404, "Transaksi tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlJwt("GET", "/api/transactions/INV-20260329093000-ABCDEFGH")),
    successExample: jsonExample("Response sukses", { success: true, data: { order_id: "INV-20260329093000-ABCDEFGH", amount: 40000, payment_status: "PAID", buy_status: "Sukses", status: "Sukses" } }),
    errorExamples: [jsonError("Transaksi tidak ditemukan", 404, { success: false, message: "Transaksi tidak ditemukan" })],
  }),
];

const apiCredentialEndpoints: ApiEndpointDoc[] = [
  jwtEndpoint({
    method: "GET",
    path: "/api/account/api-credential",
    summary: "Lihat credential API user.",
    description: "Mengembalikan data credential partner milik user aktif atau null bila belum pernah generate.",
    statusCodes: statusCodes([200, "Credential berhasil dibaca"], [401, "JWT tidak valid"]),
    requestExample: bashExample("Contoh request", curlJwt("GET", "/api/account/api-credential")),
    successExample: jsonExample("Response sukses", { success: true, data: { id: 5, api_key: "tug_xxxxx", api_key_masked: "tug_xxxxx***", secret_key_masked: "tgs.******", is_active: true, last_used_at: null, last_used_ip: null, rotated_at: "2026-03-29T09:00:00+07:00", revoked_at: null } }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  jwtEndpoint({
    method: "POST",
    path: "/api/account/api-credential",
    summary: "Generate atau rotate credential API.",
    description: "Membuat atau mengganti api_key dan secret_key credential user. plain_secret_key hanya muncul pada response generate ini.",
    statusCodes: statusCodes([201, "Credential berhasil dibuat"], [401, "JWT tidak valid"]),
    requestExample: bashExample("Contoh request", curlJwt("POST", "/api/account/api-credential")),
    successExample: jsonExample("Response sukses", { success: true, message: "Credential API berhasil dibuat.", data: { id: 5, api_key: "tug_xxxxx", api_key_masked: "tug_xxxxx***", secret_key_masked: "tgs.******", plain_secret_key: "tgs.AbCdEf1234567890", is_active: true } }),
    errorExamples: [jsonError("Unauthorized", 401, { message: "Unauthorized" })],
  }),
  jwtEndpoint({
    method: "POST",
    path: "/api/account/api-credential/regenerate-key",
    summary: "Regenerate API key credential.",
    description: "Mengganti api_key tanpa menampilkan plain secret_key lagi.",
    notes: ["Endpoint ini dibatasi throttle 3 request per menit per user/IP."],
    statusCodes: statusCodes([200, "API key berhasil diregenerate"], [404, "Credential belum dibuat"]),
    requestExample: bashExample("Contoh request", curlJwt("POST", "/api/account/api-credential/regenerate-key")),
    successExample: jsonExample("Response sukses", { success: true, message: "API key berhasil diregenerate.", data: { api_key: "tug_newkey", api_key_masked: "tug_new***", secret_key_masked: "tgs.******", is_active: true } }),
    errorExamples: [jsonError("Credential belum dibuat", 404, { success: false, message: "Credential API belum dibuat." })],
  }),
  jwtEndpoint({
    method: "PUT",
    path: "/api/account/api-credential/secret",
    summary: "Update secret key credential.",
    description: "Secret key custom harus minimal 24 karakter, hanya berisi huruf, angka, titik, garis bawah, atau strip, dan wajib mengandung huruf dan angka.",
    bodyFields: [{ name: "secret_key", type: "string", required: true, description: "Secret key baru.", example: "custom.secret1234567890" }],
    notes: ["Endpoint ini dibatasi throttle 5 request per menit per user/IP."],
    statusCodes: statusCodes([200, "Secret key berhasil diperbarui"], [404, "Credential belum dibuat"], [422, "Payload tidak valid"]),
    requestExample: bashExample("Contoh request", curlJwt("PUT", "/api/account/api-credential/secret", { secret_key: "custom.secret1234567890" })),
    successExample: jsonExample("Response sukses", { success: true, message: "Secret key berhasil diperbarui.", data: { api_key_masked: "tug_xxxxx***", secret_key_masked: "cust******", is_active: true } }),
    errorExamples: [
      jsonError("Credential belum dibuat", 404, { success: false, message: "Credential API belum dibuat." }),
      jsonError("Secret key tidak valid", 422, { message: "The secret key field format is invalid.", errors: { secret_key: ["Secret key hanya boleh berisi huruf, angka, titik, garis bawah, dan strip, serta wajib mengandung huruf dan angka."] } }),
    ],
  }),
  jwtEndpoint({
    method: "PUT",
    path: "/api/account/api-credential/status",
    summary: "Aktifkan atau nonaktifkan credential API.",
    description: "Mengubah flag is_active dan revoked_at pada credential user.",
    bodyFields: [{ name: "is_active", type: "boolean", required: true, description: "Status aktif credential.", example: "true" }],
    notes: ["Endpoint ini dibatasi throttle 5 request per menit per user/IP."],
    statusCodes: statusCodes([200, "Status credential berhasil diperbarui"], [404, "Credential belum dibuat"], [422, "Payload tidak valid"]),
    requestExample: bashExample("Contoh request", curlJwt("PUT", "/api/account/api-credential/status", { is_active: true })),
    successExample: jsonExample("Response sukses", { success: true, message: "Akses API diaktifkan.", data: { api_key_masked: "tug_xxxxx***", is_active: true, revoked_at: null } }),
    errorExamples: [jsonError("Credential belum dibuat", 404, { success: false, message: "Credential API belum dibuat." })],
  }),
];

const clientCatalogEndpoints: ApiEndpointDoc[] = [
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/categories",
    summary: "Daftar kategori partner.",
    description: "Kategori katalog partner dengan urutan berdasarkan sort lalu title.",
    statusCodes: statusCodes([200, "Kategori partner berhasil dibaca"], [401, "Signature atau credential tidak valid"], [409, "Replay request terdeteksi"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/categories")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ id: 1, title: "MOBA", sort: 1 }] }),
    errorExamples: [jsonError("Signature tidak valid", 401, { success: false, message: "Signature tidak valid." }), jsonError("Replay request", 409, { success: false, message: "Request replay terdeteksi." })],
  }),
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/games",
    summary: "Daftar game partner.",
    description: "Hanya game dengan status aktif yang dikembalikan ke partner.",
    statusCodes: statusCodes([200, "Game partner berhasil dibaca"], [401, "Signature atau credential tidak valid"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/games")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ id: 11, title: "Mobile Legends", slug: "mobile-legends", brand: "MLBB", category: { id: 1, title: "MOBA" } }] }),
    errorExamples: [jsonError("Header auth tidak lengkap", 401, { success: false, message: "Header autentikasi API tidak lengkap." })],
  }),
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/games/{slug}",
    summary: "Detail game partner.",
    description: "Mencari satu game aktif berdasarkan slug untuk kebutuhan katalog atau pre-validation checkout.",
    pathParams: [{ name: "slug", type: "string", required: true, description: "Slug game aktif.", example: "mobile-legends" }],
    statusCodes: statusCodes([200, "Game partner ditemukan"], [404, "Game tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/games/mobile-legends")),
    successExample: jsonExample("Response sukses", { success: true, data: { id: 11, title: "Mobile Legends", slug: "mobile-legends", brand: "MLBB", status: true } }),
    errorExamples: [jsonError("Game tidak ditemukan", 404, { success: false, message: "Game tidak ditemukan." })],
  }),
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/games/{slug}/products",
    summary: "Daftar produk partner per game.",
    description: "Produk diambil berdasarkan brand game, hanya status aktif, dan menyertakan info category serta promo aktif bila ada.",
    pathParams: [{ name: "slug", type: "string", required: true, description: "Slug game aktif.", example: "mobile-legends" }],
    statusCodes: statusCodes([200, "Produk partner berhasil dibaca"], [404, "Game tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/games/mobile-legends/products")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ id: 901, code: "ML86", title: "86 Diamond", brand: "MLBB", selling_price: 20000, promo_price: 18000, is_promo: true, category: { id: 4, title: "Diamond" } }] }),
    errorExamples: [jsonError("Game tidak ditemukan", 404, { success: false, message: "Game tidak ditemukan." })],
  }),
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/products/{id}",
    summary: "Detail satu produk partner.",
    description: "Detail produk individual lengkap dengan kategori dan harga partner.",
    pathParams: [{ name: "id", type: "integer", required: true, description: "ID produk.", example: "901" }],
    statusCodes: statusCodes([200, "Produk ditemukan"], [404, "Produk tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/products/901")),
    successExample: jsonExample("Response sukses", { success: true, data: { id: 901, code: "ML86", title: "86 Diamond", selling_price: 20000, promo_price: 18000, is_promo: true, category: { id: 4, title: "Diamond" } } }),
    errorExamples: [jsonError("Produk tidak ditemukan", 404, { success: false, message: "Produk tidak ditemukan." })],
  }),
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/games/{slug}/payment-methods",
    summary: "Daftar payment method partner per game.",
    description: "Saat ini backend memvalidasi game aktif dulu, lalu mengembalikan seluruh payment method aktif global.",
    pathParams: [{ name: "slug", type: "string", required: true, description: "Slug game aktif.", example: "mobile-legends" }],
    statusCodes: statusCodes([200, "Payment method berhasil dibaca"], [404, "Game tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/games/mobile-legends/payment-methods")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ id: 12, name: "QRIS", code: "QRIS", group: "E-Wallet", fee: 0, fee_percent: 0 }] }),
    errorExamples: [jsonError("Game tidak ditemukan", 404, { success: false, message: "Game tidak ditemukan." })],
  }),
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/promos",
    summary: "Daftar promo partner.",
    description: "Promo aktif berdasarkan window start_at dan end_at untuk kebutuhan banner atau katalog promo partner.",
    statusCodes: statusCodes([200, "Promo partner berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/promos")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ id: 7, title: "Weekend Blast", description: "Diskon akhir pekan", image_url: `${publicBaseUrl}/storage/promo/weekend-blast.webp` }] }),
    errorExamples: [jsonError("Credential tidak valid", 401, { success: false, message: "Credential API tidak valid atau tidak aktif." })],
  }),
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/profile",
    summary: "Profil partner dan credential aktif.",
    description: "Mengembalikan user pemilik credential dan ringkasan credential yang sedang dipakai untuk request.",
    statusCodes: statusCodes([200, "Profil partner berhasil dibaca"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/profile")),
    successExample: jsonExample("Response sukses", { success: true, data: { user: { id: 17, name: "Ferdi Ananda", email: "ferdi@example.com", whatsapp: "6281234567890", role: "basic" }, credential: { api_key: "tug_xxxxx***", is_active: true, last_used_at: "2026-03-29T09:05:00+07:00", last_used_ip: "127.0.0.1" } } }),
    errorExamples: [jsonError("Signature tidak valid", 401, { success: false, message: "Signature tidak valid." })],
  }),
];

const clientOrderEndpoints: ApiEndpointDoc[] = [
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/orders",
    summary: "Daftar order partner.",
    description: "Order di-scope ke pemilik credential aktif, mendukung pencarian q dan pagination.",
    queryParams: [
      { name: "q", type: "string", required: false, description: "Filter order_id.", example: "INV-20260329" },
      { name: "per_page", type: "integer", required: false, description: "Jumlah item per halaman, maksimal 100.", example: "10" },
    ],
    statusCodes: statusCodes([200, "Order partner berhasil dibaca"], [401, "Signature atau credential tidak valid"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/orders?q=INV-20260329&per_page=10")),
    successExample: jsonExample("Response sukses", { success: true, data: [{ order_id: "INV-20260329093000-ABCDEFGH", games: "Mobile Legends", quantity: 2, payment_status: "PAID", buy_status: "Sukses" }], meta: { current_page: 1, per_page: 10, total: 4, last_page: 1 } }),
    errorExamples: [jsonError("Credential tidak aktif", 401, { success: false, message: "Credential API tidak valid atau tidak aktif." })],
  }),
  clientEndpoint({
    method: "POST",
    path: "/api/client/v1/orders",
    summary: "Buat order partner signed dan idempotent.",
    description: "Request divalidasi oleh StoreOrderRequest client API, lalu diteruskan ke public order controller. Idempotency-Key wajib dan disimpan bersama hash payload serta response akhir.",
    headers: clientOrderHeaders,
    bodyFields: [
      { name: "id", type: "string", required: true, description: "Game ID target.", example: "12345678" },
      { name: "server", type: "string", required: false, description: "Server ID bila diperlukan.", example: "2012" },
      { name: "game", type: "string", required: true, description: "Slug game.", example: "mobile-legends" },
      { name: "product_id", type: "integer", required: true, description: "ID produk.", example: "901" },
      { name: "payment_method_id", type: "integer", required: true, description: "ID metode pembayaran.", example: "12" },
      { name: "email", type: "string", required: false, description: "Email opsional. Jika kosong backend fallback ke email user credential.", example: "ferdi@example.com" },
      { name: "whatsapp", type: "string", required: true, description: "Nomor WhatsApp tetap wajib lolos validasi request.", example: "081234567890" },
      { name: "nickname", type: "string", required: false, description: "Nickname game.", example: "FerdiML" },
      { name: "promo_code", type: "string", required: false, description: "Promo code.", example: "RAMADAN10" },
      { name: "quantity", type: "integer", required: false, description: "Jumlah item, default 1.", example: "2" },
    ],
    notes: [
      "Jika Idempotency-Key dipakai ulang dengan payload berbeda, backend mengembalikan 409.",
      "Jika request dengan Idempotency-Key yang sama sudah selesai sebelumnya, backend mengembalikan response lama yang sama.",
    ],
    statusCodes: statusCodes([201, "Order partner berhasil dibuat"], [409, "Replay idempotency atau payload conflict"], [422, "Payload tidak valid atau Idempotency-Key kosong"]),
    requestExample: bashExample("Contoh request", curlClient("POST", "/api/client/v1/orders", { id: "12345678", server: "2012", game: "mobile-legends", product_id: 901, payment_method_id: 12, whatsapp: "081234567890", nickname: "FerdiML", quantity: 2 }, true)),
    successExample: jsonExample("Response sukses", { success: true, message: "Pesanan berhasil dibuat.", orderId: "INV-20260329093000-ABCDEFGH", data: { order_id: "INV-20260329093000-ABCDEFGH", payment_status: "UNPAID", buy_status: "Pending", payment_url: "https://gateway.example/pay/INV-20260329093000-ABCDEFGH", payment_reference: "INV-20260329093000-ABCDEFGH" } }),
    errorExamples: [
      jsonError("Idempotency header kosong", 422, { success: false, message: "Header Idempotency-Key wajib diisi." }),
      jsonError("Payload conflict", 409, { success: false, message: "Idempotency-Key sudah dipakai untuk payload yang berbeda." }),
    ],
  }),
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/orders/{orderId}",
    summary: "Detail order partner.",
    description: "Mengembalikan satu order yang memang dimiliki credential aktif.",
    pathParams: [{ name: "orderId", type: "string", required: true, description: "Order ID.", example: "INV-20260329093000-ABCDEFGH" }],
    statusCodes: statusCodes([200, "Order ditemukan"], [404, "Transaksi tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/orders/INV-20260329093000-ABCDEFGH")),
    successExample: jsonExample("Response sukses", { success: true, data: { order_id: "INV-20260329093000-ABCDEFGH", games: "Mobile Legends", quantity: 2, payment_status: "PAID", buy_status: "Sukses" } }),
    errorExamples: [jsonError("Transaksi tidak ditemukan", 404, { success: false, message: "Transaksi tidak ditemukan." })],
  }),
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/orders/{orderId}/invoice",
    summary: "Detail invoice partner.",
    description: "Proxy aman ke detail invoice order milik credential aktif. Response mengikuti shape invoice publik.",
    pathParams: [{ name: "orderId", type: "string", required: true, description: "Order ID.", example: "INV-20260329093000-ABCDEFGH" }],
    statusCodes: statusCodes([200, "Invoice partner berhasil dibaca"], [404, "Invoice tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/orders/INV-20260329093000-ABCDEFGH/invoice")),
    successExample: jsonExample("Response sukses", { success: true, order: { order_id: "INV-20260329093000-ABCDEFGH", payment_status: "PAID", buy_status: "Sukses" }, game: { slug: "mobile-legends" }, product: { code: "ML86" } }),
    errorExamples: [jsonError("Invoice tidak ditemukan", 404, { success: false, message: "Invoice tidak ditemukan." })],
  }),
  clientEndpoint({
    method: "GET",
    path: "/api/client/v1/orders/{orderId}/status",
    summary: "Status ringan order partner.",
    description: "Proxy aman ke endpoint payment-status untuk polling berkala dari partner integration.",
    pathParams: [{ name: "orderId", type: "string", required: true, description: "Order ID.", example: "INV-20260329093000-ABCDEFGH" }],
    statusCodes: statusCodes([200, "Status partner berhasil dibaca"], [404, "Transaksi tidak ditemukan"]),
    requestExample: bashExample("Contoh request", curlClient("GET", "/api/client/v1/orders/INV-20260329093000-ABCDEFGH/status")),
    successExample: jsonExample("Response sukses", { success: true, data: { order_id: "INV-20260329093000-ABCDEFGH", payment_status: "PAID", buy_status: "Sukses" } }),
    errorExamples: [jsonError("Transaksi tidak ditemukan", 404, { success: false, message: "Transaksi tidak ditemukan." })],
  }),
];

const callbackEndpoints: ApiEndpointDoc[] = [
  callbackEndpoint({
    method: "POST",
    path: "/api/callback/tripay",
    summary: "Tripay payment status callback.",
    description: "Backend memverifikasi IP allowlist, X-Callback-Signature, dan X-Callback-Event sebelum mengubah status order UNPAID.",
    headers: [tripaySignatureHeader, tripayEventHeader],
    bodyFields: [
      { name: "merchant_ref", type: "string", required: true, description: "Order ID internal.", example: "INV-20260329093000-ABCDEFGH" },
      { name: "status", type: "string", required: true, description: "PAID, EXPIRED, atau FAILED.", example: "PAID" },
      { name: "is_closed_payment", type: "integer", required: true, description: "Harus bernilai 1.", example: "1" },
    ],
    notes: ["Route ini dibebaskan dari ApiKeyMiddleware dan ditujukan untuk inbound callback provider, bukan untuk frontend publik."],
    statusCodes: statusCodes([200, "Callback berhasil diproses"], [400, "Event atau payload tidak valid"], [401, "Signature salah"], [403, "IP tidak diizinkan"], [404, "Order tidak ditemukan"]),
    successExample: jsonExample("Response sukses", { success: true }),
    errorExamples: [jsonError("Unauthorized IP", 403, { success: false, message: "Unauthorized IP" }), jsonError("Invalid signature", 401, { success: false, message: "Invalid signature" })],
  }),
  callbackEndpoint({
    method: "POST",
    path: "/api/callback/paydisini",
    summary: "Paydisini callback.",
    description: "Memeriksa IP allowlist dan signature md5(apiKey + unique_code + CallbackStatus) sebelum update payment status order.",
    bodyFields: [
      { name: "key", type: "string", required: true, description: "Partner key dari Paydisini.", example: "merchant-key" },
      { name: "pay_id", type: "string", required: true, description: "Paydisini payment ID.", example: "PD123456" },
      { name: "unique_code", type: "string", required: true, description: "Order ID internal.", example: "INV-20260329093000-ABCDEFGH" },
      { name: "status", type: "string", required: true, description: "success atau status lain dari provider.", example: "success" },
      { name: "signature", type: "string", required: true, description: "Signature callback dari Paydisini.", example: "8a12f0..." },
    ],
    statusCodes: statusCodes([200, "Callback berhasil diproses"], [400, "Payload callback tidak lengkap"], [401, "Signature salah"], [403, "IP tidak diizinkan"], [404, "Order tidak ditemukan"]),
    successExample: jsonExample("Response sukses", { success: true }),
    errorExamples: [jsonError("Missing parameters", 400, { success: false, message: "Missing parameters" }), jsonError("Invalid signature", 401, { success: false, message: "Invalid signature" })],
  }),
  callbackEndpoint({
    method: "POST",
    path: "/api/callback/duitku",
    summary: "Duitku callback.",
    description: "Mengecek merchantOrderId, resultCode, amount, dan signature md5(merchantCode + amount + orderId + merchantKey).",
    bodyFields: [
      { name: "merchantOrderId", type: "string", required: true, description: "Order ID internal.", example: "INV-20260329093000-ABCDEFGH" },
      { name: "resultCode", type: "string", required: true, description: "00, 01, atau 02 sesuai status pembayaran Duitku.", example: "00" },
      { name: "amount", type: "string", required: true, description: "Nominal pembayaran.", example: "40000" },
      { name: "signature", type: "string", required: true, description: "Signature callback Duitku.", example: "4f7c9d..." },
    ],
    statusCodes: statusCodes([200, "Callback berhasil diproses"], [400, "Payload callback tidak lengkap"], [401, "Signature salah"], [404, "Order tidak ditemukan"]),
    successExample: jsonExample("Response sukses", { success: true }),
    errorExamples: [jsonError("Incomplete callback data", 400, { success: false, message: "Incomplete callback data" }), jsonError("Invalid signature", 401, { success: false, message: "Invalid signature" })],
  }),
  callbackEndpoint({
    method: "POST",
    path: "/api/callbackqris/{secret}",
    summary: "SMP QRIS callback.",
    description: "Autentikasi callback dilakukan lewat path secret. Backend juga bisa memvalidasi us_username bila setting smp.username diisi.",
    pathParams: [{ name: "secret", type: "string", required: true, description: "Secret callback yang harus cocok dengan setting backend.", example: "callback-secret" }],
    bodyFields: [
      { name: "rrn", type: "string", required: true, description: "Reference retrieval number dari callback QRIS.", example: "123456789012" },
      { name: "us_username", type: "string", required: false, description: "Username SMP yang di-compare ke setting bila ada.", example: "merchant_user" },
      { name: "amount.value", type: "string", required: false, description: "Nominal pembayaran dalam payload nested amount.value.", example: "40000.00" },
      { name: "tr_id", type: "string", required: false, description: "Transaction id provider.", example: "TRX123" },
    ],
    statusCodes: statusCodes([200, "Callback diterima"], [401, "Secret tidak valid"]),
    successExample: jsonExample("Response sukses", { responseCode: "2005200", responseMessage: "Request has been processed successfully" }),
    errorExamples: [jsonError("Unauthorized", 401, { responseCode: "4015200", responseMessage: "Unauthorized" })],
  }),
  callbackEndpoint({
    method: "POST",
    path: "/api/digiflazz/webhook",
    summary: "Digiflazz webhook.",
    description: "Memverifikasi optional X-Hub-Signature, menerima ping payload, lalu menerapkan update buy_status lewat DigiflazzService::applyWebhook.",
    headers: [digiflazzEventHeader, digiflazzSignatureHeader],
    bodyFields: [
      { name: "data.ref_id", type: "string", required: true, description: "Ref ID order/provider.", example: "INV-20260329093000-ABCDEFGH" },
      { name: "data.status", type: "string", required: true, description: "Status dari provider Digiflazz.", example: "Sukses" },
      { name: "data.message", type: "string", required: false, description: "Pesan provider.", example: "Transaction successful" },
    ],
    statusCodes: statusCodes([200, "Webhook berhasil diproses"], [400, "Body kosong atau JSON tidak valid"], [401, "Signature salah"]),
    successExample: jsonExample("Response sukses", { status: "success", message: "Order updated" }),
    errorExamples: [jsonError("Missing signature", 400, { status: "error", message: "Missing signature" }), jsonError("Invalid signature", 401, { status: "error", message: "Invalid signature" })],
  }),
  callbackEndpoint({
    method: "POST",
    path: "/api/qrispy/webhook",
    summary: "Qrispy webhook.",
    description: "Memverifikasi X-Qrispy-Signature terhadap raw body dan hanya memproses event payment.received.",
    headers: [qrispySignatureHeader],
    bodyFields: [
      { name: "event", type: "string", required: true, description: "Harus bernilai payment.received agar diproses.", example: "payment.received" },
      { name: "data.unique_id", type: "string", required: true, description: "Unique webhook id dari Qrispy.", example: "WEBHOOK123" },
      { name: "data.payment_reference", type: "string", required: true, description: "Payment reference yang berisi order_id atau prefixed order id.", example: "Order-INV-20260329093000-ABCDEFGH" },
      { name: "data.received_amount", type: "integer", required: true, description: "Nominal diterima.", example: "40000" },
    ],
    statusCodes: statusCodes([200, "Webhook berhasil diproses atau di-ignore"], [400, "Payload kosong atau JSON salah"], [401, "Signature salah"], [404, "Order tidak ditemukan"], [422, "Field penting hilang"]),
    successExample: jsonExample("Response sukses", { success: true }),
    errorExamples: [jsonError("Invalid signature", 401, { success: false, message: "Invalid signature" }), jsonError("Ignored event", 200, { success: true, ignored: true })],
  }),
  callbackEndpoint({
    method: "POST",
    path: "/api/webhook",
    summary: "Alias Qrispy webhook.",
    description: "Alias kedua ke handler Qrispy webhook yang sama dengan /api/qrispy/webhook.",
    headers: [qrispySignatureHeader],
    notes: ["Route ini mengarah ke handler yang sama dengan /api/qrispy/webhook."],
    statusCodes: statusCodes([200, "Webhook berhasil diproses"], [401, "Signature salah"]),
    successExample: jsonExample("Response sukses", { success: true }),
    errorExamples: [jsonError("Invalid signature", 401, { success: false, message: "Invalid signature" })],
  }),
];

export const apiDocsMeta = {
  title: "TopUp Game API",
  description:
    "Referensi endpoint utama untuk public API, route akun berbasis JWT, Client API v1, dan callback provider.",
  publicBaseUrl,
  publicApiBaseUrl,
  clientApiBaseUrl,
  environment: "Base URL mengikuti environment backend aktif",
  rateLimits: [
    "Client API auth gate: 60 request per menit per kombinasi credential dan IP.",
    "Client API master endpoints: 120 request per menit per credential dan IP.",
    "Client API create order: 20 request per menit per credential dan IP.",
    "Review invoice dibatasi throttle 5 request per menit, profile 20 request per menit, rotate key 3 request per menit.",
  ],
  stringToSign: `UPPER(METHOD) + "\\n" + PATH + "\\n" + X-API-TIMESTAMP + "\\n" + X-API-NONCE + "\\n" + SHA256(BODY_RAW_JSON)`,
};

export const apiAuthSchemes: ApiAuthScheme[] = [
  {
    title: "Public REST",
    badge: "X-API-KEY",
    description: "Dipakai semua route /api non client seperti settings, games, blog, promo, order, invoice, dan endpoint publik lainnya.",
    headers: `Accept: application/json\nX-API-KEY: <server-api-key>`,
  },
  {
    title: "User JWT",
    badge: "X-API-KEY + Bearer JWT",
    description: "Dipakai route /api/auth/user, /api/account/*, dan /api/transactions/*.",
    headers: `Accept: application/json\nX-API-KEY: <server-api-key>\nAuthorization: Bearer <jwt-token>`,
  },
  {
    title: "Client API v1",
    badge: "Signed request",
    description: "Dipakai partner integration resmi di /api/client/v1 dengan credential per user, timestamp, nonce, dan HMAC signature.",
    headers: `Accept: application/json\nX-API-KEY: <client-api-key>\nX-API-TIMESTAMP: <unix-timestamp>\nX-API-NONCE: <unique-nonce>\nX-API-SIGNATURE: <sha256-hmac-signature>`,
  },
  {
    title: "Provider Callback",
    badge: "Inbound webhook",
    description: "Dipakai provider payment atau fulfillment yang menembak callback langsung ke backend. Setiap provider punya signature dan aturan sendiri.",
    headers: `Contoh: X-Callback-Signature, X-Qrispy-Signature, X-Hub-Signature, atau secret di path`,
  },
];

export const apiHighlights: ApiHighlight[] = [
  {
    title: "Dokumentasi sekarang mengikuti route aktif",
    description: "Group endpoint mencakup authentication, public catalog, order legacy, akun, partner client API v1, dan inbound callbacks yang benar-benar terdaftar di routes/api.php.",
  },
  {
    title: "Response examples mengikuti shape controller",
    description: "Contoh response sekarang memakai key yang benar seperti games, populerGames, blogs, page, promo, review, plain_secret_key, dan struktur profile partner yang nested.",
  },
  {
    title: "Full path memakai base URL environment",
    description: "Dokumentasi tidak lagi memakai placeholder statis. Full path dan cURL dibentuk dari NEXT_PUBLIC_API_URL backend aktif.",
  },
  {
    title: "Alias route tetap ditandai jelas",
    description: "Route alias seperti /api/order-config/{slug}, /api/transactions/realtime, dan /api/webhook tetap terdokumentasi supaya integrasi lama tidak hilang konteksnya.",
  },
];

export const apiQuickStartSteps: ApiQuickStartStep[] = [
  {
    step: "01",
    title: "Tentukan jalur integrasi",
    description: "Frontend publik internal masih bisa memakai Public REST, tetapi integrasi partner baru sebaiknya langsung memakai Client API v1 signed.",
  },
  {
    step: "02",
    title: "Generate credential user",
    description: "Login sebagai user, generate credential di /api/account/api-credential, lalu simpan api_key dan plain_secret_key dengan aman di backend Anda.",
  },
  {
    step: "03",
    title: "Ambil katalog resmi",
    description: "Baca /api/client/v1/categories, games, products, payment-methods, dan promos agar checkout tidak menebak struktur data backend.",
  },
  {
    step: "04",
    title: "Buat order secara idempotent",
    description: "Gunakan POST /api/client/v1/orders dengan Idempotency-Key unik agar retry jaringan tidak membuat invoice ganda.",
  },
  {
    step: "05",
    title: "Pantau status sampai final",
    description: "Simpan order_id lalu polling /api/client/v1/orders/{orderId}/status sampai payment_status dan buy_status mencapai kondisi final.",
  },
];

export const apiTransactionLifecycle: ApiLifecycleStage[] = [
  {
    title: "Order dibuat",
    paymentStatus: "UNPAID",
    buyStatus: "Pending",
    description: "Invoice sudah terbentuk, payment reference sudah ada, tetapi pembayaran belum tervalidasi.",
  },
  {
    title: "Pembayaran tervalidasi",
    paymentStatus: "PAID",
    buyStatus: "Proses",
    description: "Gateway callback atau status poll menandai pembayaran sukses dan fulfillment mulai berjalan.",
  },
  {
    title: "Fulfillment selesai",
    paymentStatus: "PAID",
    buyStatus: "Sukses",
    description: "Kondisi final yang aman untuk dianggap selesai oleh partner dan frontend invoice.",
  },
  {
    title: "Fulfillment gagal",
    paymentStatus: "PAID",
    buyStatus: "Gagal",
    description: "Pembayaran sukses, tetapi proses pengiriman item gagal. Biasanya perlu penanganan operasional atau refund.",
  },
  {
    title: "Pembayaran batal/expired",
    paymentStatus: "FAILED / EXPIRED",
    buyStatus: "Batal",
    description: "Order tidak pernah tervalidasi sampai habis waktu, atau gateway mengembalikan status gagal.",
  },
];

export const apiFaqs: ApiFaq[] = [
  {
    question: "Apakah Client API v1 masih butuh X-API-KEY global dari env aplikasi?",
    answer: "Tidak. Route /api/client/v1 melewati ApiKeyMiddleware global dan memakai credential per user dari tabel api_credentials lewat AuthenticateClientApi.",
  },
  {
    question: "Header apa saja yang wajib untuk Client API v1?",
    answer: "X-API-KEY, X-API-TIMESTAMP, X-API-NONCE, dan X-API-SIGNATURE. Untuk create order tambahkan Idempotency-Key.",
  },
  {
    question: "Apakah secret key pernah ditampilkan penuh lagi setelah generate credential?",
    answer: "Tidak. plain_secret_key hanya muncul saat generate POST /api/account/api-credential. Setelah itu backend hanya mengembalikan versi masked atau menerima secret baru saat update.",
  },
  {
    question: "Apa kombinasi status final yang aman untuk dianggap sukses?",
    answer: "Gunakan payment_status=PAID dan buy_status=Sukses. Jangan menganggap pembayaran sukses sebagai transaksi final tanpa melihat buy_status.",
  },
  {
    question: "Kenapa ada beberapa route alias di dokumentasi?",
    answer: "Karena route alias memang masih aktif di backend, misalnya /api/order-config/{slug}, /api/transactions/realtime, dan /api/webhook. Dokumentasi menandainya jelas supaya integrasi lama tetap terbaca konteksnya.",
  },
];

export const apiEndpointGroups: ApiEndpointGroup[] = [
  {
    id: "auth",
    title: "Authentication",
    description: "Registrasi, login, OTP, Google auth, dan pengecekan JWT user aktif.",
    endpoints: authEndpoints,
  },
  {
    id: "public-catalog",
    title: "Public Content & Catalog",
    description: "Settings, sitemap, slider, kategori, games, blog, promo, dan helper promo code yang diakses lewat X-API-KEY global.",
    endpoints: publicCatalogEndpoints,
  },
  {
    id: "legacy-commerce",
    title: "Legacy Public Order & Invoice",
    description: "Flow checkout publik existing, invoice, review, pencarian invoice, dan realtime transaction yang masih dipakai website saat ini.",
    endpoints: legacyCommerceEndpoints,
  },
  {
    id: "account",
    title: "Account & User Transactions",
    description: "Route akun user, update profile/password, list transaksi, dan ringkasan transaksi berbasis JWT.",
    endpoints: accountEndpoints,
  },
  {
    id: "api-credential",
    title: "API Credential Management",
    description: "Generate, rotate, update secret, dan toggle credential partner per user.",
    endpoints: apiCredentialEndpoints,
  },
  {
    id: "client-catalog",
    title: "Client API v1 Catalog",
    description: "Katalog resmi partner yang ditandatangani: kategori, games, products, payment methods, promo, dan profile credential aktif.",
    endpoints: clientCatalogEndpoints,
  },
  {
    id: "client-orders",
    title: "Client API v1 Orders",
    description: "Order partner yang signed, idempotent, dan aman untuk retry maupun polling status.",
    endpoints: clientOrderEndpoints,
  },
  {
    id: "callbacks",
    title: "Callbacks & Webhooks",
    description: "Inbound endpoint dari provider payment atau fulfillment. Bukan untuk frontend publik, tetapi tetap aktif dan relevan untuk audit integrasi.",
    endpoints: callbackEndpoints,
  },
];

const pickReferenceEndpoints = (source: ApiEndpointDoc[], entries: string[]) =>
  entries
    .map((entry) => source.find((endpoint) => `${endpoint.method} ${endpoint.path}` === entry))
    .filter((endpoint): endpoint is ApiEndpointDoc => Boolean(endpoint));

export const apiReferenceEndpointGroups: ApiEndpointGroup[] = [
  {
    id: "auth",
    title: "Autentikasi",
    description: "Endpoint login, registrasi, dan sesi user yang paling sering dipakai frontend maupun panel partner.",
    endpoints: pickReferenceEndpoints(authEndpoints, [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "POST /api/auth/google",
      "GET /api/auth/user",
    ]),
  },
  {
    id: "public-catalog",
    title: "Katalog publik",
    description: "Data dasar yang dipakai storefront untuk memuat game, detail produk, dan validasi promo.",
    endpoints: pickReferenceEndpoints(publicCatalogEndpoints, [
      "GET /api/settings",
      "GET /api/games",
      "GET /api/games/{slug}",
      "POST /api/promo/validate",
    ]),
  },
  {
    id: "legacy-commerce",
    title: "Order publik & invoice",
    description: "Flow checkout publik yang masih aktif: ambil konfigurasi order, buat invoice, lalu polling status pembayaran.",
    endpoints: pickReferenceEndpoints(legacyCommerceEndpoints, [
      "GET /api/order/{slug}",
      "POST /api/order",
      "GET /api/invoice/{order_id}",
      "GET /api/invoice/{order_id}/payment-status",
    ]),
  },
  {
    id: "account",
    title: "Akun & credential",
    description: "Endpoint akun berbasis JWT untuk membaca profil user dan mengelola credential Client API.",
    endpoints: [
      ...pickReferenceEndpoints(accountEndpoints, ["GET /api/account/me"]),
      ...pickReferenceEndpoints(apiCredentialEndpoints, [
        "GET /api/account/api-credential",
        "POST /api/account/api-credential",
        "POST /api/account/api-credential/regenerate-key",
      ]),
    ],
  },
  {
    id: "client-catalog",
    title: "Client API v1: katalog",
    description: "Endpoint inti partner untuk sinkron katalog, produk, dan metode pembayaran.",
    endpoints: pickReferenceEndpoints(clientCatalogEndpoints, [
      "GET /api/client/v1/profile",
      "GET /api/client/v1/games",
      "GET /api/client/v1/games/{slug}/products",
      "GET /api/client/v1/games/{slug}/payment-methods",
    ]),
  },
  {
    id: "client-orders",
    title: "Client API v1: order",
    description: "Pembuatan order signed, detail invoice, dan polling status sampai transaksi final.",
    endpoints: pickReferenceEndpoints(clientOrderEndpoints, [
      "GET /api/client/v1/orders",
      "POST /api/client/v1/orders",
      "GET /api/client/v1/orders/{orderId}/invoice",
      "GET /api/client/v1/orders/{orderId}/status",
    ]),
  },
  {
    id: "callbacks",
    title: "Callback provider",
    description: "Webhook inbound utama dari payment gateway dan provider fulfillment.",
    endpoints: pickReferenceEndpoints(callbackEndpoints, [
      "POST /api/callback/tripay",
      "POST /api/digiflazz/webhook",
      "POST /api/qrispy/webhook",
    ]),
  },
].filter((group) => group.endpoints.length > 0);
