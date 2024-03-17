import ETHTokenList from "../../../json/ETHTokenList.json";
import GoerliTokenList from "../../../json/GoerliTokenList.json";
import CFXTokenList from "../../../json/CFXTokenList.json";
import CFXTestnetTokenList from "../../../json/CFXTestnetTokenList.json";

const getTokenList = (activeChainID) => {
  switch (activeChainID) {
    case 1:
      return ETHTokenList;
    case 5:
      return GoerliTokenList;
    case 1030:
      return CFXTokenList;
    case 71:
      return CFXTestnetTokenList;
  }
};

export default getTokenList;
