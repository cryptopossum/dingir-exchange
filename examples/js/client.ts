import * as caller from "@eeston/grpc-caller";
import Decimal from "decimal.js";

const file = "../../proto/exchange/matchengine.proto";
const load = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
};
const server = process.env.GRPC_SERVER || "localhost:50051";
console.log("using grpc", server);
const client = caller(`${server}`, { file, load }, "Matchengine");

export async function balanceQuery(user_id): Promise<Map<string, any>> {
  const balances = (await client.BalanceQuery({ user_id: user_id })).balances;
  let result = new Map();
  for (const entry of balances) {
    result.set(entry.asset_id, entry);
  }
  return result;
}

export async function balanceQueryByAsset(user_id, asset) {
  const allBalances = (
    await client.BalanceQuery({ user_id: user_id, assets: [asset] })
  ).balances;
  const balance = allBalances.find(item => item.asset_id == asset);
  let available = new Decimal(balance.available);
  let frozen = new Decimal(balance.frozen);
  let total = available.add(frozen);
  return { available, frozen, total };
}

export async function balanceUpdate(
  user_id,
  asset,
  business,
  business_id,
  delta,
  detail
) {
  return await client.BalanceUpdate({
    user_id,
    asset,
    business,
    business_id,
    delta,
    detail: JSON.stringify(detail)
  });
}

export async function orderPut(
  user_id,
  market,
  order_side,
  order_type,
  amount,
  price,
  taker_fee,
  maker_fee
) {
  return await client.OrderPut({
    user_id,
    market,
    order_side,
    order_type,
    amount,
    price,
    taker_fee,
    maker_fee
  });
}

export async function assetList() {
  return (await client.AssetList({})).asset_lists;
}

export async function marketList() {
  return (await client.MarketList({})).markets;
}

export async function orderDetail(market, order_id) {
  return await client.OrderDetail({ market, order_id });
}

export async function marketSummary(req) {
  let markets;
  if (req == null) {
    markets = [];
  } else if (typeof req === "string") {
    markets = [req];
  } else if (Array.isArray(req)) {
    markets = req;
  }
  let resp = (await client.MarketSummary({ markets })).market_summaries;
  if (typeof req === "string") {
    return resp.find(item => item.name === req);
  }
  return resp;
}

export async function reloadMarkets(from_scratch: boolean = false) {
  return await client.ReloadMarkets({ from_scratch });
}

export async function orderCancel(user_id, market, order_id) {
  return await client.OrderCancel({ user_id, market, order_id });
}

export async function orderCancelAll(user_id, market) {
  return await client.OrderCancelAll({ user_id, market });
}

export async function orderDepth(market, limit, interval) {
  return await client.OrderBookDepth({ market, limit, interval });
}

export async function transfer(from, to, asset, delta, memo = "") {
  return await client.transfer({
    from,
    to,
    asset,
    delta,
    memo
  });
}

export async function debugDump() {
  return await client.DebugDump({});
}

export async function debugReset() {
  return await client.DebugReset({});
}

export async function debugReload() {
  return await client.DebugReload({});
}

export async function registerUser(user) {
  return await client.RegisterUser({
    user_id: user.id,
    l1_address: user.l1_address,
    l2_pubkey: user.l2_pubkey
  });
}
