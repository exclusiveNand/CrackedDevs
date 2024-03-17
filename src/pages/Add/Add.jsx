import "./Add.scss";

const Add = () => {
  const { swapType, setSwapType } = useSwapType();

  const { activeChain } = useContext(ChainContext);

  const { poolAddress } = useParams();

  const { handleApprove } = useHandleTx();

  const { estimatedGas, estimateGas } = useEstimate();

  const {
    pair_Percent,
    tokenE_Amount,
    tokenX_Amount,
    tokenY_Amount,
    onAmountChange,
    getToken,
    handleChangeToken,
    onPairPercentChange,
    getTokenList,
  } = useTokens(activeChain.chainID);

  const { isOpen, closeModal, openModal, changeToken } = useModal();

  return (
    <div className="SwapPage">
      <div className="SwapContainer">
        <div className="SwapBoxContainer">
          <div className="SwapBoxTitle">
            <span>LP Swap</span>
          </div>
          <div className="SwapBoxInputContainer">
            {swapType === "e-x/y" && (
              <div className="SwapBoxInput">
                <div className="SwapBoxInputTitle">
                  <span>Swap Amount</span>
                </div>
                <div className="SwapBoxInputLabelContainer tokenELabelContainer">
                  <div
                    onClick={() => {
                      openModal("tokenE");
                    }}
                    className="SwapBoxInputLabel tokenELabel"
                  >
                    {getToken("tokenE").img && (
                      <img src={getToken("tokenE").img} alt="icon" />
                    )}
                    {getToken("tokenE")?.symbol}
                    <span>&#9660;</span>
                  </div>
                </div>
                <div className="SwapBoxInputFieldContainer">
                  <Input
                    value={tokenE_Amount}
                    onChange={(e) => onAmountChange(e, "tokenE")}
                    className="SwapBoxInputField"
                    placeholder="0.0"
                  />
                </div>
              </div>
            )}

            {swapType === "a/b-x/y" && (
              <div className="SwapBoxInput">
                <div className="SwapBoxInputTitle">
                  <span>Swap Amount</span>
                </div>
                <div className="SwapBoxInputLabelContainer">
                  <div
                    className={`SwapBoxInputLabel ${
                      getToken("tokenA").img
                        ? ""
                        : "SwapBoxInputLabelNotSelected"
                    }`}
                    onClick={() => {
                      openModal("tokenA");
                    }}
                  >
                    {getToken("tokenA").img && (
                      <img src={getToken("tokenA").img} alt="icon" />
                    )}
                    {getToken("tokenA").symbol}
                    <span>&#9660;</span>
                  </div>
                  <div
                    className={`SwapBoxInputLabel ${
                      getToken("tokenB").img
                        ? ""
                        : "SwapBoxInputLabelNotSelected"
                    }`}
                    onClick={() => {
                      openModal("tokenB");
                    }}
                  >
                    {getToken("tokenB").img && (
                      <img src={getToken("tokenB").img} alt="icon" />
                    )}
                    {getToken("tokenB").symbol}
                    <span>&#9660;</span>
                  </div>
                </div>
                <div className="SwapBoxInputSliderContainer">
                  <div className="SwapBoxInputSliderValue">
                    <span>{pair_Percent}%</span>
                  </div>
                  <Slider
                    value={pair_Percent}
                    onChange={(e, newValue) => {
                      onPairPercentChange(newValue);

                      estimateGas(
                        getToken("tokenA").address,
                        getToken("tokenB").address,
                        getToken("tokenX").address,
                        getToken("tokenY").address,
                        swapType
                      );
                    }}
                    className="SwapBoxInputSlider"
                    defaultValue={0}
                  />
                  <div className="SwapBoxInputSliderValueMarks">
                    <span
                      onClick={() => {
                        onPairPercentChange(25);
                      }}
                    >
                      25%
                    </span>
                    <span
                      onClick={() => {
                        onPairPercentChange(50);
                      }}
                    >
                      50%
                    </span>
                    <span
                      onClick={() => {
                        onPairPercentChange(75);
                      }}
                    >
                      75%
                    </span>
                    <span
                      onClick={() => {
                        onPairPercentChange(100);
                      }}
                    >
                      Max
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="seperatorArrContainer">
              <span className="seperatorArr">&#129123;</span>
            </div>
            <div className="SwapBoxOutput">
              <span className="SwapBoxOutputTitle">Estimated Pool</span>
              <div className="SwapBoxOutputContainer">
                <span>{tokenX_Amount || "-"}</span>
                <div
                  onClick={() => {
                    openModal("tokenX");
                  }}
                  className="SwapBoxOutputLabel"
                >
                  {getToken("tokenX").img && (
                    <img src={getToken("tokenX").img} alt="icon" />
                  )}
                  {getToken("tokenX").symbol}
                  <span>&#9660;</span>
                </div>
              </div>
              <div className="SwapBoxOutputContainer">
                <span>{tokenY_Amount || "-"}</span>
                <div
                  onClick={() => {
                    openModal("tokenY");
                  }}
                  className="SwapBoxOutputLabel"
                >
                  {getToken("tokenY").img && (
                    <img src={getToken("tokenY").img} alt="icon" />
                  )}
                  {getToken("tokenY").symbol}
                  <span>&#9660;</span>
                </div>
              </div>
              <div className="EstimatedGas">
                <span>Estimated Gas</span>
                <span>{estimatedGas || "-"}</span>
              </div>
            </div>
          </div>

          <button
            className="SwapBoxButton"
            disabled={
              tokenX_Amount === undefined || tokenY_Amount === undefined
            }
            onClick={() => {
              handleApprove(
                getToken("tokenA").address,
                getToken("tokenB").address,
                pair_Percent,
                getToken("tokenE").address,
                tokenE_Amount,
                getToken("tokenX").address,
                getToken("tokenY").address,
                swapType
              );
            }}
          >
            Approve
          </button>
        </div>
      </div>
      <Modal
        open={isOpen}
        title="Select a token"
        footer={null}
        width={300}
        onCancel={() => {
          closeModal();
        }}
      >
        <div className="SwapModal">
          {getTokenList().map((token, index) => {
            return (
              <div
                key={index}
                onClick={() => {
                  handleChangeToken(index, changeToken);
                  closeModal();
                }}
                className="SwapModalItem"
              >
                {token.img && <img src={token.img} alt="icon" />}
                {token.name}
              </div>
            );
          })}
        </div>
      </Modal>
    </div>
  );
};

export default Add;
