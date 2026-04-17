import type {
  Product,
  CompetitorItem,
  Suggestion,
  SuggestionLevel,
  SuggestionAction,
} from "@/types/price-monitor";

const URGENT_THRESHOLD = 0.10;
const RECOMMEND_THRESHOLD = 0.03;
const MARGIN_FLOOR_RATIO = 1.10;

export function analyze({
  myProduct,
  competitors,
}: {
  myProduct: Product;
  competitors: CompetitorItem[];
}): Suggestion {
  const minViablePrice = Math.ceil(myProduct.cost_price * MARGIN_FLOOR_RATIO);

  if (competitors.length === 0) {
    return {
      myProduct,
      minViablePrice,
      competitorCount: 0,
      lowestCompetitor: null,
      level: "no_data",
      title: "競合データなし",
      summary: "競合価格が取得できませんでした。検索条件を変更するか、時間をおいて再検索してください。",
      diffAmount: null,
      diffRatio: null,
      actions: [actionHold("現状維持", "競合データなしのため、現在の価格を維持します。")],
    };
  }

  const lowest = competitors[0];
  const diff = myProduct.my_price - lowest.effective_price;
  const ratio = diff / lowest.effective_price;

  let level: SuggestionLevel;
  let title: string;
  let summary: string;
  const actions: SuggestionAction[] = [];

  if (ratio <= 0) {
    level = "good";
    title = "価格優位";
    summary = `自社価格は競合最安値より${Math.abs(diff).toLocaleString()}円安く、優位な状態です。`;
    actions.push(actionHold("現状維持", `自社 ¥${myProduct.my_price.toLocaleString()} ≤ 競合最安 ¥${lowest.effective_price.toLocaleString()}。現在の価格を維持してください。`));
  } else if (ratio < RECOMMEND_THRESHOLD) {
    level = "monitor";
    title = "要監視";
    const pointPct = Math.ceil(ratio * 100 + 0.5);
    summary = `自社価格は競合最安より${diff.toLocaleString()}円（${(ratio * 100).toFixed(1)}%）高い状態です。軽い施策で対応可能です。`;
    actions.push(actionPoint(pointPct, `ポイント${pointPct}%還元で実質価格を競合水準まで下げられます。利益への直接影響はありません。`));
    actions.push(actionHold("静観", "3%未満の差は許容範囲です。競合の動向を継続監視してください。"));
  } else if (ratio < URGENT_THRESHOLD) {
    level = "recommend";
    title = "施策推奨";
    summary = `自社価格は競合最安より${diff.toLocaleString()}円（${(ratio * 100).toFixed(1)}%）高い状態です。クーポン発行を推奨します。`;
    actions.push(actionCoupon(myProduct, diff, minViablePrice));
    const pointPct = Math.ceil(ratio * 100 + 0.5);
    actions.push(actionPoint(pointPct, `ポイント${pointPct}%還元で実質的に競合と同水準に。値引きしたくない場合の選択肢です。`));
  } else {
    level = "urgent";
    title = "緊急対応";
    summary = `自社価格は競合最安より${diff.toLocaleString()}円（${(ratio * 100).toFixed(1)}%）高い状態です。早急な値下げまたは大型クーポンが必要です。`;
    actions.push(actionPriceChange(myProduct, lowest.effective_price, minViablePrice));
    actions.push(actionCoupon(myProduct, diff, minViablePrice));
  }

  return {
    myProduct,
    minViablePrice,
    competitorCount: competitors.length,
    lowestCompetitor: lowest,
    level,
    title,
    summary,
    diffAmount: diff,
    diffRatio: ratio,
    actions,
  };
}

function actionCoupon(
  product: Product,
  couponAmount: number,
  minViablePrice: number
): SuggestionAction {
  const afterCoupon = product.my_price - couponAmount;
  const profit = afterCoupon - product.cost_price;
  const marginRatio = ((profit / afterCoupon) * 100).toFixed(1);
  const warning =
    afterCoupon < minViablePrice
      ? `粗利下限（¥${minViablePrice.toLocaleString()}）を下回ります。利益率に注意してください。`
      : undefined;

  return {
    type: "coupon",
    label: `¥${couponAmount.toLocaleString()} クーポン発行`,
    detail: `適用後価格: ¥${afterCoupon.toLocaleString()} / 粗利: ¥${profit.toLocaleString()}（${marginRatio}%）`,
    warning,
  };
}

function actionPriceChange(
  product: Product,
  targetPrice: number,
  minViablePrice: number
): SuggestionAction {
  const profit = targetPrice - product.cost_price;
  const marginRatio = ((profit / targetPrice) * 100).toFixed(1);
  const warning =
    targetPrice < minViablePrice
      ? `粗利下限（¥${minViablePrice.toLocaleString()}）を下回ります。利益率に注意してください。`
      : undefined;

  return {
    type: "price_change",
    label: `¥${targetPrice.toLocaleString()} へ値下げ`,
    detail: `現在 ¥${product.my_price.toLocaleString()} → ¥${targetPrice.toLocaleString()} / 粗利: ¥${profit.toLocaleString()}（${marginRatio}%）`,
    warning,
  };
}

function actionPoint(pct: number, detail: string): SuggestionAction {
  return { type: "point", label: `ポイント ${pct}% 還元`, detail };
}

function actionHold(label: string, detail: string): SuggestionAction {
  return { type: "hold", label, detail };
}
