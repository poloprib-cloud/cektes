import { ApiAuthScheme, ApiEndpointDoc, ApiEndpointGroup, ApiParamDoc, HttpMethod } from "./types";

const publicBaseUrl = (process.env.NEXT_PUBLIC_API_URL || "{{BASE_URL}}").replace(/\/$/, "");
const publicApiBaseUrl = `${publicBaseUrl}/api`;

const acceptHeader: ApiParamDoc = {
  name: "Accept",
  type: "string",
  required: true,
  description: "Gunakan application/json agar response selalu dikembalikan dalam format JSON.",
  example: "application/json",
};

const apiKeyHeader: ApiParamDoc = {
  name: "X-API-KEY",
  type: "string",
  required: true,
  description: "API key publik yang diverifikasi oleh ApiKeyMiddleware untuk seluruh route public API.",
  example: "server-api-key",
};

const publicHeaders: ApiParamDoc[] = [acceptHeader, apiKeyHeader];

const json = (value: unknown) => JSON.stringify(value, null, 2);

const statusCodes = (...items: Array<[number, string]>) => items.map(([code, description]) => ({ code, description }));

const makeId = (method: HttpMethod, path: string) =>
  `${method.toLowerCase()}-${path.replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`;

const buildCurl = (method: HttpMethod, url: string, headers: string[], body?: unknown) => {
  const lines = [`curl -X ${method} '${url}'`, ...headers.map((header) => `  -H '${header}'`)];

  if (body !== undefined) {
    lines.push("  -H 'Content-Type: application/json'");
    lines.push(`  -d '${typeof body === "string" ? body : JSON.stringify(body)}'`);
  }

  return lines.join(" \\\n");
};

const curlPublic = (method: HttpMethod, path: string, body?: unknown) =>
  buildCurl(method, `${publicBaseUrl}${path}`, ["Accept: application/json", "X-API-KEY: <server-api-key>"], body);

const endpoint = (doc: Omit<ApiEndpointDoc, "id" | "fullPath"> & { fullPath?: string }): ApiEndpointDoc => ({
  id: makeId(doc.method, doc.path),
  fullPath: doc.fullPath ?? `${publicBaseUrl}${doc.path}`,
  ...doc,
});

const publicEndpoint = (
  doc: Omit<ApiEndpointDoc, "id" | "fullPath" | "auth" | "headers"> & { headers?: ApiParamDoc[] }
): ApiEndpointDoc =>
  endpoint({
    ...doc,
    auth: ["X-API-KEY"],
    headers: doc.headers ?? publicHeaders,
  });

const catalogEndpoints: ApiEndpointDoc[] = [
  publicEndpoint({
    method: "GET",
    path: "/api/games",
    summary: "Daftar game publik",
    description:
      "Mengembalikan daftar game dari GameController::index beserta daftar game populer. Response memakai dua koleksi top-level: games dan populerGames.",
    statusCodes: statusCodes([200, "Daftar game berhasil dibaca"], [401, "X-API-KEY tidak valid atau tidak dikirim"]),
    requestExample: {
      title: "Contoh request",
      language: "bash",
      content: curlPublic("GET", "/api/games"),
    },
    successExample: {
      title: "Contoh response sukses",
      language: "json",
      content: json({
        success: true,
        games: [
          {
            id: 11,
            image: "https://example.com/storage/games/mobile-legends.png",
            banner: "https://example.com/storage/games/mobile-legends-banner.png",
            title: "Mobile Legends",
            developers: "Moonton",
            brand: "MLBB",
            category_id: 1,
            slug: "mobile-legends",
            description: "Top up diamond Mobile Legends.",
            status: true,
            populer: true,
            sort: 1,
            category: {
              id: 1,
              title: "MOBA",
            },
          },
        ],
        populerGames: [
          {
            id: 11,
            image: "https://example.com/storage/games/mobile-legends.png",
            banner: "https://example.com/storage/games/mobile-legends-banner.png",
            title: "Mobile Legends",
            developers: "Moonton",
            brand: "MLBB",
            category_id: 1,
            slug: "mobile-legends",
            description: "Top up diamond Mobile Legends.",
            status: true,
            populer: true,
            sort: 1,
          },
        ],
      }),
    },
    errorExamples: [
      {
        title: "Unauthorized",
        status: 401,
        content: json({
          message: "Unauthorized",
        }),
      },
    ],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/games/{slug}",
    summary: "Detail game berdasarkan slug",
    description:
      "Route ini terdaftar pada routes/api.php sebagai GameController::show, tetapi method show() tidak ditemukan pada source GameController yang aktif saat ini.",
    pathParams: [
      {
        name: "slug",
        type: "string",
        required: true,
        description: "Slug game.",
        example: "mobile-legends",
      },
    ],
    notes: [
      "Pada source backend aktif, implementasi detail game berbasis slug yang dipakai halaman order saat ini berasal dari OrderController::index pada route /api/order/{slug}.",
      "Karena method show() tidak ada di GameController yang terpasang sekarang, dokumentasi ini hanya menampilkan kontrak route dan catatan implementasinya, bukan contoh payload sukses yang bersifat asumsi.",
    ],
    statusCodes: statusCodes([401, "X-API-KEY tidak valid atau tidak dikirim"]),
    requestExample: {
      title: "Contoh request",
      language: "bash",
      content: curlPublic("GET", "/api/games/mobile-legends"),
    },
    errorExamples: [
      {
        title: "Unauthorized",
        status: 401,
        content: json({
          message: "Unauthorized",
        }),
      },
    ],
  }),
];

const transactionEndpoints: ApiEndpointDoc[] = [
  publicEndpoint({
    method: "POST",
    path: "/api/order",
    summary: "Buat order publik",
    description:
      "Membuat transaksi baru melalui OrderController::store. Endpoint ini memvalidasi game, produk, metode pembayaran, promo, lalu membuat referensi pembayaran dan menyimpan order.",
    bodyFields: [
      {
        name: "id",
        type: "string",
        required: true,
        description: "User ID atau game ID target transaksi.",
        example: "12345678",
      },
      {
        name: "server",
        type: "string",
        required: false,
        description: "Server ID bila game memerlukannya.",
        example: "2012",
      },
      {
        name: "game",
        type: "string",
        required: true,
        description: "Slug game yang aktif.",
        example: "mobile-legends",
      },
      {
        name: "product_id",
        type: "integer",
        required: true,
        description: "ID produk yang dipilih.",
        example: "901",
      },
      {
        name: "payment_method_id",
        type: "integer",
        required: true,
        description: "ID metode pembayaran yang dipilih.",
        example: "12",
      },
      {
        name: "email",
        type: "string",
        required: false,
        description: "Email pemesan.",
        example: "kallpolo@example.com",
      },
      {
        name: "whatsapp",
        type: "string",
        required: true,
        description: "Nomor WhatsApp pemesan.",
        example: "081234567890",
      },
      {
        name: "nickname",
        type: "string",
        required: false,
        description: "Nickname game bila tersedia.",
        example: "KallpoloML",
      },
      {
        name: "promo_code",
        type: "string",
        required: false,
        description: "Kode promo yang ingin diterapkan.",
        example: "RAMADAN10",
      },
      {
        name: "quantity",
        type: "integer",
        required: false,
        description: "Jumlah item. Default 1.",
        example: "2",
      },
    ],
    notes: [
      "Field game harus berisi slug game aktif, bukan title game.",
      "Gunakan orderId pada response untuk membuka detail invoice dan polling status pembayaran.",
      "Jika payload dasar tidak valid, Laravel validation akan mengembalikan response 422 dengan field message dan errors.",
    ],
    statusCodes: statusCodes(
      [201, "Order berhasil dibuat"],
      [404, "Game, produk, atau metode pembayaran tidak ditemukan"],
      [422, "Produk tidak sesuai game, promo tidak valid, atau payload tidak lolos validasi"],
      [500, "Gagal membuat transaksi pembayaran atau menyimpan order"]
    ),
    requestExample: {
      title: "Contoh request",
      language: "bash",
      content: curlPublic("POST", "/api/order", {
        id: "12345678",
        server: "2012",
        game: "mobile-legends",
        product_id: 901,
        payment_method_id: 12,
        email: "kallpolo@example.com",
        whatsapp: "081234567890",
        nickname: "KallpoloML",
        promo_code: "RAMADAN10",
        quantity: 2,
      }),
    },
    successExample: {
      title: "Contoh response sukses",
      language: "json",
      content: json({
        success: true,
        message: "Pesanan berhasil dibuat.",
        orderId: "INV-20260329093000-ABCDEFGH",
        data: {
          order_id: "INV-20260329093000-ABCDEFGH",
          payment_status: "UNPAID",
          buy_status: "Pending",
          payment_url: "https://gateway.example/pay/INV-20260329093000-ABCDEFGH",
          payment_code: "INV-20260329093000-ABCDEFGH",
          payment_reference: "INV-20260329093000-ABCDEFGH",
          qr_url: null,
          expired_at: "2026-03-29T10:00:00+07:00",
          quantity: 2,
          total_price: 40000,
          pricing: {
            quantity: 2,
            has_promo: true,
            promo_code: "RAMADAN10",
            unit_price_before_promo: 22000,
            unit_discount: 2000,
            unit_price_after_promo: 20000,
            subtotal_before_promo: 44000,
            promo_discount: 4000,
            subtotal_after_promo: 40000,
            payment_fee: 0,
            unique_code: 0,
            total_price: 40000,
          },
        },
      }),
    },
    errorExamples: [
      {
        title: "Produk tidak sesuai game",
        status: 422,
        content: json({
          success: false,
          message: "Produk tidak sesuai dengan game yang dipilih.",
        }),
      },
      {
        title: "Validasi payload gagal",
        status: 422,
        content: json({
          message: "The id field is required. (and 2 more errors)",
          errors: {
            id: ["The id field is required."],
            game: ["The game field is required."],
            whatsapp: ["The whatsapp field is required."],
          },
        }),
      },
    ],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/invoice/{order_id}",
    summary: "Detail invoice",
    description:
      "Mengembalikan detail invoice dari InvoiceController::show. Response memuat object order, object game hasil mapGame(), dan object product hasil mapProduct().",
    pathParams: [
      {
        name: "order_id",
        type: "string",
        required: true,
        description: "Order ID invoice.",
        example: "INV-20260329093000-ABCDEFGH",
      },
    ],
    notes: [
      "Ketika payment_status masih UNPAID dan expired_time sudah lewat, controller akan menandai order sebagai EXPIRED sebelum response dikembalikan.",
      "Field order pada response mengikuti model Order dan ditambah field turunan seperti pricing, payment_code_display, qr_string, atau qr_image_url bila tersedia.",
    ],
    statusCodes: statusCodes([200, "Invoice berhasil dibaca"], [404, "Invoice tidak ditemukan"]),
    requestExample: {
      title: "Contoh request",
      language: "bash",
      content: curlPublic("GET", "/api/invoice/INV-20260329093000-ABCDEFGH"),
    },
    successExample: {
      title: "Contoh response sukses",
      language: "json",
      content: json({
        success: true,
        order: {
          order_id: "INV-20260329093000-ABCDEFGH",
          games: "Mobile Legends",
          product: "86 Diamond",
          code_product: "ML86",
          id_games: "12345678",
          server_games: "2012",
          nickname: "KallpoloML",
          email: "kallpolo@example.com",
          whatsapp: "081234567890",
          quantity: 2,
          price: 20000,
          discount_price: 22000,
          promo_discount: 4000,
          fee: 0,
          total_price: 40000,
          payment_name: "QRIS",
          payment_method: "QRIS",
          payment_code: "INV-20260329093000-ABCDEFGH",
          payment_code_display: "INV-20260329093000-ABCDEFGH",
          expired_time: 1711699200,
          payment_status: "PAID",
          buy_status: "Sukses",
          pricing: {
            quantity: 2,
            has_promo: true,
            promo_code: "RAMADAN10",
            unit_price_before_promo: 22000,
            unit_discount: 2000,
            unit_price_after_promo: 20000,
            subtotal_before_promo: 44000,
            promo_discount: 4000,
            subtotal_after_promo: 40000,
            payment_fee: 0,
            unique_code: 0,
            total_price: 40000,
          },
        },
        game: {
          id: 11,
          title: "Mobile Legends",
          slug: "mobile-legends",
          brand: "MLBB",
          developers: "Moonton",
          image: "https://example.com/storage/games/mobile-legends.png",
          banner: "https://example.com/storage/games/mobile-legends-banner.png",
          description: "Top up diamond Mobile Legends.",
          populer: true,
          status: true,
        },
        product: {
          id: 901,
          code: "ML86",
          title: "86 Diamond",
          brand: "MLBB",
          logo: "https://example.com/storage/logos/mlbb.png",
          game_image: "https://example.com/storage/games/mobile-legends.png",
          image: "https://example.com/storage/logos/mlbb.png",
        },
      }),
    },
    errorExamples: [
      {
        title: "Invoice tidak ditemukan",
        status: 404,
        content: json({
          success: false,
          message: "Invoice tidak ditemukan.",
        }),
      },
    ],
  }),
  publicEndpoint({
    method: "GET",
    path: "/api/invoice/{order_id}/payment-status",
    summary: "Status pembayaran invoice",
    description:
      "Endpoint ringan untuk polling payment_status dan buy_status dari InvoiceController::paymentStatus. Response sukses selalu memakai top-level success dan data.",
    pathParams: [
      {
        name: "order_id",
        type: "string",
        required: true,
        description: "Order ID invoice.",
        example: "INV-20260329093000-ABCDEFGH",
      },
    ],
    notes: [
      "Data yang dikembalikan mengikuti statusPayload() dan memuat field qrispy_* serta dompetx_* bila provider terkait digunakan.",
      "Jika invoice UNPAID tetapi sudah expired, controller akan menandai order sebagai EXPIRED lalu mengembalikan status terbaru.",
    ],
    statusCodes: statusCodes([200, "Status pembayaran berhasil dibaca"], [404, "Invoice tidak ditemukan"]),
    requestExample: {
      title: "Contoh request",
      language: "bash",
      content: curlPublic("GET", "/api/invoice/INV-20260329093000-ABCDEFGH/payment-status"),
    },
    successExample: {
      title: "Contoh response sukses",
      language: "json",
      content: json({
        success: true,
        data: {
          order_id: "INV-20260329093000-ABCDEFGH",
          payment_status: "PAID",
          buy_status: "Sukses",
          expired_time: 1711699200,
          qrispy_qris_id: null,
          qrispy_expires_at: null,
          qrispy_paid_at: null,
          dompetx_transaction_id: null,
          dompetx_expires_at: null,
          dompetx_paid_at: null,
        },
      }),
    },
    errorExamples: [
      {
        title: "Invoice tidak ditemukan",
        status: 404,
        content: json({
          success: false,
          message: "Invoice tidak ditemukan.",
        }),
      },
    ],
  }),
];

export const apiDocsMeta = {
  title: "TopUp Game Public API",
  description:
    "Dokumentasi ini hanya memuat endpoint publik yang dibutuhkan untuk katalog game, pembuatan order, detail invoice, dan polling status pembayaran.",
  publicBaseUrl,
  publicApiBaseUrl,
  environment: "Base URL mengikuti NEXT_PUBLIC_API_URL yang aktif",
  usageNotes: [
    "Seluruh endpoint pada halaman ini memakai header X-API-KEY.",
    "GET /api/games dipakai untuk katalog. POST /api/order dipakai untuk membuat transaksi.",
    "Setelah order dibuat, gunakan endpoint invoice untuk menampilkan detail dan memantau status pembayaran.",
  ],
};

export const apiAuthSchemes: ApiAuthScheme[] = [
  {
    title: "Public REST",
    badge: "X-API-KEY",
    description: "Dipakai untuk katalog publik, pembuatan order, detail invoice, dan polling status pembayaran.",
    headers: "Accept: application/json\nX-API-KEY: <server-api-key>",
  },
];

export const apiEndpointGroups: ApiEndpointGroup[] = [
  {
    id: "public-catalog",
    title: "Katalog Publik",
    description: "Endpoint untuk membaca daftar game dan route detail game yang tersedia untuk publik.",
    endpoints: catalogEndpoints,
  },
  {
    id: "public-order-invoice",
    title: "Order & Invoice",
    description: "Endpoint untuk membuat transaksi dan memantau invoice pembayaran.",
    endpoints: transactionEndpoints,
  },
];
