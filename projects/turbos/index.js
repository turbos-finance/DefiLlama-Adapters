const sui = require("../helper/chain/sui");
const axios = require("axios");

async function getPoolFactoryConfig() {
  const result = await axios.get(
    "https://s3.amazonaws.com/app.turbos.finance/sdk/contract.json"
  );
  return result.data.mainnet.contract.PoolConfig;
}

async function tvl(_timestamp, _block, _chainBlocks, { api }) {
  const poolFactoryConfig = await getPoolFactoryConfig();
  const parent = await sui.getObject(poolFactoryConfig);
  const poolFields = await sui.getDynamicFieldObjects({
    parent: parent.fields.pools.fields.id.id,
  });
  const poolIds = poolFields.map((item) => item.fields.value.fields.pool_id);
  const poolList = await sui.getObjects(poolIds);
  poolList.forEach(({ type, fields }) => {
    const [coinA, coinB] = type.replace(">", "").split("<")[1].split(", ");
    api.add(coinA, fields.coin_a);
    api.add(coinB, fields.coin_b);
  });
}

module.exports = {
  sui: {
    tvl,
  },
};
