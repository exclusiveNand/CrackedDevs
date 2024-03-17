const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const { URL } = require("./helper");

const getTotalVolume = async () => {
  const query = `{
        factories {
          totalVolumeUSD
        }
    }`;
  return axios.post(URL, { query }).then((result) => {
    return result.data.data.factories[0].totalVolumeUSD;
  });
};

const getVolumeByPool = async (poolAddress) => {
  const query = `{
        pool(id: "${poolAddress}") {
          volumeUSD
        }
      }`;
  const result = await axios.post(URL, { query });
  return result.data.data.pool.volumeUSD;
};

getVolumeByPool("0x6c6bc977e13df9b0de53b251522280bb72383700").then((result) => {
  console.log(result);
});
