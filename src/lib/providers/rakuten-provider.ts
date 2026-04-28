import type { PriceProvider } from "./types";
import type { CompetitorItem, SearchQuery } from "@/types/price-monitor";

// 楽天ウェブサービス 新API（2026-02-10〜）。旧API（app.rakuten.co.jp）は 2026-05-13 に完全停止。
// 新API は applicationId（UUID）+ accessKey（pk_...）の二要素認証 + Origin ヘッダー必須。
// Origin はアプリ登録URLのドメインに一致させる（実測: Referer は弾かれ Origin のみ通る挙動）。
const RAKUTEN_ENDPOINT = "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260401";
const RAKUTEN_ORIGIN = "https://github.com"; // 楽天アプリ登録URL: https://github.com/HYPHEN1003/violal_competitive_research のオリジン

// 楽天 API は「1秒1リクエスト」推奨だが、短時間バーストは概ね通る実測。
// 完全直列だと 1検索 = メイン1 + ベンチマーク3 + 自社1 = 5本 × 1.1秒 ≈ 5.5秒。
// 並列度2 + 最小間隔700ms + 429時の指数バックオフリトライで平均 ~2-3 秒に短縮する。
const RAKUTEN_CONCURRENCY = 2;
const RAKUTEN_MIN_INTERVAL_MS = 700;
let rakutenInFlight = 0;
let rakutenNextSlot = 0;
const rakutenWaiters: Array<() => void> = [];

async function rakutenAcquire(): Promise<void> {
  if (rakutenInFlight >= RAKUTEN_CONCURRENCY) {
    await new Promise<void>((resolve) => rakutenWaiters.push(resolve));
  }
  rakutenInFlight++;
  const now = Date.now();
  const slot = Math.max(rakutenNextSlot, now);
  rakutenNextSlot = slot + RAKUTEN_MIN_INTERVAL_MS;
  const wait = slot - now;
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}

function rakutenRelease(): void {
  rakutenInFlight--;
  const next = rakutenWaiters.shift();
  if (next) next();
}

// 同一クエリの短期キャッシュ（TTL 60秒）。検索ボタン連打や複数SKU閲覧時に効く。
const RAKUTEN_CACHE_TTL_MS = 60_000;
const rakutenCache = new Map<string, { ts: number; data: Array<Record<string, unknown>> }>();

// violal 自身の楽天出品は自社なので除外
const SELF_SHOP_PATTERN = /violal/i;
// 中古/ノイズ/キッズ判定（Yahooプロバイダと同じパターン）
const USED_NAME_PATTERN = /(中古|USED|ユーズド|リユース|フリマ|ジャンク|訳あり|難あり|使用済|古着|汚れ|よごれ|ヨゴレ|キズあり|傷あり)/i;
const NOISE_NAME_PATTERN = /(靴紐|シューレース|シューキーパー|シューツリー|シューケア|クリーナー|洗剤|防水スプレー|消臭|撥水|インソール|中敷き?|靴クリーム|ワックス|ポリッシュ|艶出し|ソックス|靴下|キーホルダー|ステッカー|ピンバッジ|マスク|ハンガー|シュータン|保護|スプレー|ゴルフマーカー|マーカー|フィギュア|模型|ミニチュア|おまけ|景品|DVD|Blu-?ray|BD|CD|書籍|雑誌|ブック|MOOK|ムック|BOOK|レコード|ヴァイナル|アナログ盤|ボール|ラケット|氷のう|アイスパック|保冷剤|色焼け|見切り品|返品不可|キッズ|ジュニア|子ども|子供|こども|ベビー|赤ちゃん|男児|女児|少年|少女)/i;
const KIDS_SIZE_PATTERN = /(\b(1[0-9]|2[0-2])\s?[-～〜~]\s?(1[0-9]{1,2}|2[0-2])\b|\b1[0-9]\.[0-9]\s?[～〜~]\s?2[0-2]\.[0-9]\b)/;

// 自社商品自体に NOISE/KIDS キーワードがある場合はその語で結果除外しない（false negative防止）
function buildFilterOptions(query: SearchQuery): { skipNoise: boolean; skipKids: boolean } {
  const text = `${query.name ?? ""} ${query.brand ?? ""} ${query.model ?? ""}`;
  return {
    skipNoise: NOISE_NAME_PATTERN.test(text),
    skipKids: KIDS_SIZE_PATTERN.test(text) || /キッズ|ジュニア|子ども|子供|こども/.test(text),
  };
}

// brand==model は「型番未設定」のセンチネル（DB上 model にブランド名が入っているケース、例: AS2OV）。
// このとき brand+model 検索だと全ブランド商品にマッチするので、直接 name-strict へフォールバック。
function isModelSentinel(query: SearchQuery): boolean {
  return Boolean(query.brand && query.model && query.brand.toLowerCase() === query.model.toLowerCase());
}

// brand+model 検索の結果から「商品名に model が含まれるもの」のみを残す。
// 楽天のキーワード検索は AND ではなく関連度マッチなので、ブランドだけ合致した別型番が混入する。
function filterByModelInName<T extends { item_name: string }>(items: T[], model: string): T[] {
  const m = model.toLowerCase();
  return items.filter((i) => i.item_name.toLowerCase().includes(m));
}

// name フォールバック時の誤マッチ（版違い等）対策。先頭5語を必須トークンとして全含み検査。
function strictTokenMatchFilter<T extends { item_name: string }>(items: T[], queryName: string): T[] {
  const tokens = queryName
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .map((t) => t.toLowerCase())
    .filter((t) => t.length > 0);
  if (tokens.length === 0) return items;
  return items.filter((item) => {
    const lower = item.item_name.toLowerCase();
    return tokens.every((tok) => lower.includes(tok));
  });
}

function toCompetitorItems(
  rawItems: Array<Record<string, unknown>>,
  options: { excludeSelf?: boolean; skipNoise?: boolean; skipKids?: boolean } = { excludeSelf: true }
): CompetitorItem[] {
  return rawItems
    .filter((wrapper) => {
      const it = (wrapper as { Item: Record<string, unknown> }).Item;
      const shop = String(it.shopName ?? "");
      const name = String(it.itemName ?? "");
      if (options.excludeSelf && (SELF_SHOP_PATTERN.test(shop) || SELF_SHOP_PATTERN.test(name))) {
        return false;
      }
      if (USED_NAME_PATTERN.test(name)) return false;
      if (!options.skipNoise && NOISE_NAME_PATTERN.test(name)) return false;
      if (!options.skipKids && KIDS_SIZE_PATTERN.test(name)) return false;
      return true;
    })
    .map((wrapper) => {
      const it = (wrapper as { Item: Record<string, unknown> }).Item;
      const price = Number(it.itemPrice) || 0;
      // postageFlag === 1 は「価格に送料込み」= 送料無料扱い
      const freeShipping = it.postageFlag === 1;
      const shippingFee: number | null = freeShipping ? 0 : null;
      const shippingName = freeShipping ? "送料無料" : "送料別";
      const effectivePrice = freeShipping ? price + 0 : price;
      const sellerId = it.shopCode ? String(it.shopCode) : undefined;
      const janCode = it.janCode ? String(it.janCode) : undefined;

      return {
        mall: "楽天",
        item_name: String(it.itemName ?? ""),
        shop_name: String(it.shopName ?? ""),
        price,
        shipping_fee: shippingFee,
        shipping_name: shippingName,
        effective_price: effectivePrice,
        url: String(it.itemUrl ?? ""),
        seller_id: sellerId,
        jan_code: janCode,
      };
    });
}

async function callRakuten(extraParams: Record<string, string>): Promise<Array<Record<string, unknown>>> {
  const appId = process.env.RAKUTEN_APP_ID;
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  if (!appId || !accessKey) {
    throw new Error("RAKUTEN_APP_ID または RAKUTEN_ACCESS_KEY が設定されていません");
  }
  const params = new URLSearchParams({
    applicationId: appId,
    accessKey: accessKey,
    format: "json",
    hits: "30",
    sort: "+itemPrice",
    ...extraParams,
  });

  // キャッシュキーは認証情報を除いた検索条件のみ
  const cacheKey = new URLSearchParams(params);
  cacheKey.delete("applicationId");
  cacheKey.delete("accessKey");
  const key = cacheKey.toString();
  const now = Date.now();
  const cached = rakutenCache.get(key);
  if (cached && now - cached.ts < RAKUTEN_CACHE_TTL_MS) {
    return cached.data;
  }

  await rakutenAcquire();
  try {
    let lastError: Error | null = null;
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const res = await fetch(`${RAKUTEN_ENDPOINT}?${params}`, {
          headers: { Origin: RAKUTEN_ORIGIN },
        });
        // 429 はバックオフして再試行（500ms, 1500ms, 3000ms）
        if (res.status === 429) {
          if (attempt < 2) {
            await new Promise((r) => setTimeout(r, 500 * Math.pow(3, attempt)));
            continue;
          }
          throw new Error("楽天API: rate limit (429) — リトライ上限");
        }
        if (!res.ok) {
          throw new Error(`楽天API エラー: ${res.status} ${res.statusText}`);
        }
        const json = await res.json();
        const items: Array<Record<string, unknown>> = json.Items ?? [];
        rakutenCache.set(key, { ts: now, data: items });
        return items;
      } catch (e) {
        lastError = e as Error;
        if (attempt < 2) await new Promise((r) => setTimeout(r, 500));
      }
    }
    throw lastError ?? new Error("楽天API: 不明なエラー");
  } finally {
    rakutenRelease();
  }
}

async function fetchFromShop(query: SearchQuery, shopCode: string): Promise<CompetitorItem[]> {
  // ベンチマーク用: 特定のショップに限定して検索。violal自社除外は不要（benchmark対象は他社前提）
  const base = { shopCode };
  const flt = buildFilterOptions(query);
  const opts = { excludeSelf: false, ...flt };

  if (query.jan) {
    const items = await callRakuten({ ...base, keyword: query.jan });
    return toCompetitorItems(items, opts);
  }

  if (query.brand && query.model && !isModelSentinel(query)) {
    const byModel = toCompetitorItems(
      await callRakuten({ ...base, keyword: `${query.brand} ${query.model}` }),
      opts
    );
    const exact = filterByModelInName(byModel, query.model);
    if (exact.length > 0) return exact;
    if (query.name) {
      const byName = toCompetitorItems(
        await callRakuten({ ...base, keyword: query.name }),
        opts
      );
      return strictTokenMatchFilter(byName, query.name);
    }
    return [];
  }

  if (query.name) {
    const items = toCompetitorItems(
      await callRakuten({ ...base, keyword: query.name }),
      opts
    );
    return strictTokenMatchFilter(items, query.name);
  }

  return [];
}

export const rakutenProvider: PriceProvider & {
  fetchFromShop: (query: SearchQuery, shopCode: string) => Promise<CompetitorItem[]>;
} = {
  async fetchPrices(query: SearchQuery): Promise<CompetitorItem[]> {
    const flt = buildFilterOptions(query);
    const opts = { excludeSelf: true, ...flt };

    // 優先順位: JAN > ブランド+型番 > 商品名
    if (query.jan) {
      const items = await callRakuten({ keyword: query.jan });
      return toCompetitorItems(items, opts);
    }

    if (query.brand && query.model && !isModelSentinel(query)) {
      const byModel = toCompetitorItems(await callRakuten({ keyword: `${query.brand} ${query.model}` }), opts);
      const exact = filterByModelInName(byModel, query.model);
      if (exact.length > 0) return exact;
      if (query.name) {
        const byName = toCompetitorItems(await callRakuten({ keyword: query.name }), opts);
        return strictTokenMatchFilter(byName, query.name);
      }
      return [];
    }

    if (query.name) {
      const items = toCompetitorItems(await callRakuten({ keyword: query.name }), opts);
      return strictTokenMatchFilter(items, query.name);
    }

    return [];
  },
  fetchFromShop,
};
