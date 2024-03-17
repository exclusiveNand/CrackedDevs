const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
/* CONFIGUARATION */
dotenv.config();
const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/api/v1/quote", (req, res) => {
  const { tokenIn, tokenOut, fee, amountIn } = req.query;
  const { getOutputQuote } = require("./scripts/quoter");
  getOutputQuote(tokenIn, tokenOut, fee, amountIn)
    .then((quote) => {
      res.status(200).json({ quote });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.get("/api/v1/swap", async (req, res) => {
  const {
    tokenIn,
    tokenOut,
    fee,
    amountIn,
    amountOutMinimum,
    amountOut,
    amountInMaximum,
    swapType,
  } = req.query;
  const { swap } = require("./scripts/swap");
  const params = await swap(
    tokenIn,
    tokenOut,
    parseInt(fee),
    amountIn,
    amountOutMinimum,
    amountOut,
    amountInMaximum,
    swapType
  );
  res.status(200).json({ params });
});

app.get("/api/v1/positions", async (req, res) => {
  const { fetchPostions } = require("./scripts/fetchPosition");
  const { walletAddress } = req.query;
  console.log(walletAddress);
  const positions = await fetchPostions(walletAddress);
  res.status(200).json({ positions });
});

app.get("/api/v1/addLiquidity", async (req, res) => {
  const { tokenId, amount0, amount1 } = req.query;
  const { addLiquidity } = require("./scripts/addLiquidity");
  const params = await addLiquidity(tokenId, amount0, amount1);
  res.status(200).json({ params });
});

app.get("/api/v1/removeLiquidity", async (req, res) => {
  const { tokenId, removePercent, recipient } = req.query;
  // DENOMINATOR = 10000;
  const { removeLiquidity } = require("./scripts/removeLiquidity");
  const params = await removeLiquidity(tokenId, removePercent, recipient);
  res.status(200).json({ params });
});

app.get("/api/v1/swapLP", async (req, res) => {
  const { tokenRemoveId, removePercent, tokenAddId, recipient } = req.query;
  const { swapLP } = require("./scripts/swapLP");
  const params = await swapLP(
    parseInt(tokenRemoveId),
    removePercent,
    parseInt(tokenAddId),
    recipient
  );
  res.status(200).json({ params });
});

app.get("/api/v2/swapLPQuote", async (req, res) => {
  const { tokenRemove, tokenAdd, removePercent, recipient } = req.query;
  const { swapLPQuote } = require("./v2/index");
  const quote = await swapLPQuote(
    tokenRemove,
    removePercent,
    tokenAdd,
    recipient
  );
  res.status(200).json({ quote });
});

app.get("/api/v2/swapTokenForLP", async (req, res) => {
  const { token, tokenAdd, amount, recipient } = req.query;
  const { swapTokenForLP } = require("./v2/index");
  const calldata = await swapTokenForLP(token, tokenAdd, amount, recipient);
  res.status(200).json({ calldata });
});

app.get("/api/v2/swapLPForLP", async (req, res) => {
  const { tokenRemove, tokenAdd, removePercent, sender, recipient } = req.query;
  const { swapLPForLP } = require("./v2/index");
  const calldata = await swapLPForLP(
    tokenRemove,
    tokenAdd,
    sender,
    removePercent,
    recipient
  );
  res.status(200).json({ calldata });
});

app.get("/api/v2/getUserPool", async (req, res) => {
  const { walletAddress } = req.query;
  const { getUserPool } = require("./v2/index");
  const pools = await getUserPool(walletAddress);
  res.status(200).json({ pools });
});

app.get("/api/v2/getAllowance", async (req, res) => {
  const { token, owner } = req.query;
  const { getAllowance } = require("./v2/index");
  const allowance = await getAllowance(token, owner);
  res.status(200).json({ allowance });
});

app.get("/api/v2/approve", (req, res) => {
  const { approve } = require("./v2/index");
  const data = approve();
  res.status(200).json({ data });
});

app.get("/api/v2/getSwapParams", async (req, res) => {
  const { tokenA, tokenB, removePercent, tokenX, tokenY, sender, isEncoded } =
    req.query;
  const { getSwapParams } = require("./v2/index");
  const params = await getSwapParams(
    tokenA,
    tokenB,
    removePercent,
    tokenX,
    tokenY,
    sender,
    isEncoded
  );
  res.status(200).json({ params });
});

app.get("/api/v2/getTokenToLPParams", (req, res) => {
  const { tokenIn, amountIn, tokenA, tokenB, sender, isEncoded } = req.query;
  const { getTokenToLPParams } = require("./v2/index");
  const params = getTokenToLPParams(
    tokenIn,
    amountIn,
    tokenA,
    tokenB,
    sender,
    isEncoded
  );
  res.status(200).json({ params });
});

app.get("/api/v2/removeLPToToken", async (req, res) => {
  const { tokenA, tokenB, removePercent, sender, tokenOut, isEncoded } =
    req.query;
  const { removeLPToToken } = require("./v2/index");
  const params = await removeLPToToken(
    tokenA,
    tokenB,
    removePercent,
    sender,
    tokenOut,
    isEncoded
  );
  res.status(200).json({ params });
});

app.get("/api/v2/estimateOutput", async (req, res) => {
  const { tokenA, tokenB, amountA, amountB, tokenX, tokenY } = req.query;
  const { estimateOutput } = require("./v2/index");
  const output = await estimateOutput(
    tokenA,
    tokenB,
    amountA,
    amountB,
    tokenX,
    tokenY
  );
  res.status(200).json({ output });
});

app.listen(9000, () => {
  console.log("Server running on port 9000");
});
