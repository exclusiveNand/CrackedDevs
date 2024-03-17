import "./Pools.scss";
import useUserPools from "./hooks/useUserPools";
import formattedShare from "./utils/formattedShare";
import getIconURLFromSymbol from "./utils/getIconURLFromSymbol";
import getSymbolFromAddress from "./utils/getSymbolFromAddress";
import formattedAmount from "./utils/formattedAmount";
import { useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";
import { ChainContext } from "../../Contexts/ChainContext";
import { useContext } from "react";

const Pools = () => {
  const { activeChain } = useContext(ChainContext);

  const { address } = useAccount();

  const { userPoolsList } = useUserPools();

  const navigate = useNavigate();

  return (
    <div className="Pools">
      <div className="PoolsContainer">
        <div className="PoolsTitle">
          <span>Pools</span>
          <span></span>
        </div>

        <div className="UserPoolsList">
          {address === undefined && (
            <span className="UserPoolsListItemWalletNotConnected">
              Connect your wallet
            </span>
          )}
          {address && userPoolsList.length == 0 && (
            <span className="UserPoolsListItemEmpty">
              <img src="/Loading.png" alt="loading" />
            </span>
          )}
          {userPoolsList.map((pool, index) => {
            return (
              <div
                key={index}
                className="UserPoolsListItem"
                onClick={() => {
                  navigate(
                    `/swap/${pool.pairAddress}&${getSymbolFromAddress(
                      pool.token0,
                      activeChain.chainID
                    )}&${getSymbolFromAddress(
                      pool.token1,
                      activeChain.chainID
                    )}&${formattedAmount(
                      pool.token0Pooled,
                      getSymbolFromAddress(pool.token0, activeChain.chainID),
                      activeChain.chainID
                    )}&${formattedAmount(
                      pool.token1Pooled,
                      getSymbolFromAddress(pool.token1, activeChain.chainID),
                      activeChain.chainID
                    )}`
                  );
                }}
              >
                <div className="UserPoolsListItemTitle">
                  <img
                    src={getIconURLFromSymbol(
                      getSymbolFromAddress(pool.token0, activeChain.chainID),
                      activeChain.chainID
                    )}
                    alt="token0"
                    className="UserPoolsListItemTitleToken0Img"
                  />
                  <img
                    src={getIconURLFromSymbol(
                      getSymbolFromAddress(pool.token1, activeChain.chainID),
                      activeChain.chainID
                    )}
                    alt="token1"
                    className="UserPoolsListItemTitleToken1Img"
                  />
                  <span>
                    {getSymbolFromAddress(pool.token0, activeChain.chainID)}/
                    {getSymbolFromAddress(pool.token1, activeChain.chainID)}
                  </span>
                </div>
                <div className="UserPoolsListItemContentContainer">
                  <div className="UserPoolsListItemContent">
                    <span className="UserPoolsListItemContentText">
                      Your total pool tokens:
                    </span>
                    <span className="UserPoolsListItemContentValue">
                      {formattedAmount(
                        pool.poolBalance,
                        "pool",
                        activeChain.chainID
                      )}
                    </span>
                  </div>
                  <div className="UserPoolsListItemContent">
                    <span className="UserPoolsListItemContentText">
                      Pooled{" "}
                      {getSymbolFromAddress(pool.token0, activeChain.chainID)}:
                    </span>
                    <span className="UserPoolsListItemContentValue">
                      {formattedAmount(
                        pool.token0Pooled,
                        getSymbolFromAddress(pool.token0, activeChain.chainID),
                        activeChain.chainID
                      )}
                    </span>
                  </div>
                  <div className="UserPoolsListItemContent">
                    <span className="UserPoolsListItemContentText">
                      Pooled{" "}
                      {getSymbolFromAddress(pool.token1, activeChain.chainID)}:
                    </span>
                    <span className="UserPoolsListItemContentValue">
                      {formattedAmount(
                        pool.token1Pooled,
                        getSymbolFromAddress(pool.token1, activeChain.chainID),
                        activeChain.chainID
                      )}
                    </span>
                  </div>
                  <div className="UserPoolsListItemContent">
                    <span className="UserPoolsListItemContentText">
                      Your pool share:
                    </span>
                    <span className="UserPoolsListItemContentValue">
                      {formattedShare(pool.poolSharePercent)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Pools;
