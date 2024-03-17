// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.6.6;
pragma experimental ABIEncoderV2;

import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/safeERC20.sol";

contract LPAggreator {
    using SafeERC20 for IERC20;
    struct AddLPParams {
        address tokenA;
        address tokenB;
        uint256 amountADesired;
        uint256 amountBDesired;
        uint256 amountAMin;
        uint256 amountBMin;
        address to;
        uint256 deadline;
    }

    struct AddLPParamsETH {
        address token;
        uint256 amountTokenDesired;
        uint256 amountETHDesired;
        uint256 amountTokenMin;
        uint256 amountETHMin;
        address to;
        uint256 deadline;
    }

    struct RemoveLPParams {
        address tokenA;
        address tokenB;
        uint256 liquidity;
        uint256 amountAMin;
        uint256 amountBMin;
        address to;
        uint256 deadline;
    }

    struct RemoveLPParamsETH {
        address token;
        uint256 liquidity;
        uint256 amountTokenMin;
        uint256 amountETHMin;
        address to;
        uint256 deadline;
    }

    mapping(address => IUniswapV2Router02) public routers02;

    address private constant FACTORY =
        0x36B83E0D41D1dd9C73a006F0c1cbC1F096E69E34;
    address private constant UNISWAP_ROUTER02_ADDRESS =
        0x873789aaF553FD0B4252d0D2b72C6331c47aff2E;
    address private constant CETH = 0x2ED3dddae5B2F321AF0806181FBFA6D049Be47d8;

    constructor() public {
        routers02[UNISWAP_ROUTER02_ADDRESS] = IUniswapV2Router02(
            UNISWAP_ROUTER02_ADDRESS
        );
    }

    function removeLiquidity(
        RemoveLPParams memory removeParams
    ) internal returns (uint256 amountARemoved, uint256 amountBRemoved) {
        // Transfer LP from user to this contract
        address pair = IUniswapV2Factory(FACTORY).getPair(
            removeParams.tokenA,
            removeParams.tokenB
        );

        IERC20(pair).safeTransferFrom(
            msg.sender,
            address(this),
            removeParams.liquidity
        );

        IERC20(pair).safeApprove(
            UNISWAP_ROUTER02_ADDRESS,
            removeParams.liquidity
        );

        // Remove liquidity
        (amountARemoved, amountBRemoved) = routers02[UNISWAP_ROUTER02_ADDRESS]
            .removeLiquidity(
                removeParams.tokenA,
                removeParams.tokenB,
                removeParams.liquidity,
                0,
                0,
                address(this),
                block.timestamp
            );
    }

    function addLiquidity(
        AddLPParams memory addParams
    ) internal returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        IERC20(addParams.tokenA).safeApprove(
            UNISWAP_ROUTER02_ADDRESS,
            addParams.amountADesired
        );
        IERC20(addParams.tokenB).safeApprove(
            UNISWAP_ROUTER02_ADDRESS,
            addParams.amountBDesired
        );
        (amountA, amountB, liquidity) = routers02[UNISWAP_ROUTER02_ADDRESS]
            .addLiquidity(
                addParams.tokenA,
                addParams.tokenB,
                addParams.amountADesired,
                addParams.amountBDesired,
                addParams.amountAMin,
                addParams.amountBMin,
                addParams.to,
                block.timestamp
            );

        if (amountA < addParams.amountADesired) {
            IERC20(addParams.tokenA).safeApprove(UNISWAP_ROUTER02_ADDRESS, 0);
        }

        if (amountB < addParams.amountBDesired) {
            IERC20(addParams.tokenB).safeApprove(UNISWAP_ROUTER02_ADDRESS, 0);
        }

        // Transfer remain token to user
        uint256 amountETH = swapFromTokensToETH(
            addParams.amountADesired - amountA,
            addParams.tokenA,
            addParams.amountBDesired - amountB,
            addParams.tokenB
        );
        if (amountETH > 0) {
            IERC20(CETH).safeTransfer(msg.sender, amountETH);
        }
    }

    function swapFromTokensToETH(
        uint256 amountA,
        address tokenA,
        uint256 amountB,
        address tokenB
    ) internal returns (uint256 amountETH) {
        // Swap from removed token to ETH
        if (tokenA == CETH) {
            amountETH = amountA;
        } else if (amountA > 0) {
            IERC20(tokenA).safeApprove(UNISWAP_ROUTER02_ADDRESS, amountA);
            address[] memory path = new address[](2);
            path[0] = tokenA;
            path[1] = CETH;
            uint[] memory amounts = routers02[UNISWAP_ROUTER02_ADDRESS]
                .swapExactTokensForTokens(
                    amountA,
                    0,
                    path,
                    address(this),
                    block.timestamp
                );
            amountETH += amounts[1];
        }

        if (tokenB == CETH) {
            amountETH += amountB;
        } else if (amountB > 0) {
            IERC20(tokenB).safeApprove(UNISWAP_ROUTER02_ADDRESS, amountB);
            address[] memory path = new address[](2);
            path[0] = tokenB;
            path[1] = CETH;
            uint[] memory amounts = routers02[UNISWAP_ROUTER02_ADDRESS]
                .swapExactTokensForTokens(
                    amountB,
                    0,
                    path,
                    address(this),
                    block.timestamp
                );
            amountETH += amounts[1];
        }
    }

    function swapFromTokenToETH(
        uint256 amountA,
        address tokenA
    ) internal returns (uint256 amountETH) {
        // Swap from removed token to ETH
        if (tokenA == CETH) {
            amountETH = amountA;
        } else if (amountA > 0) {
            IERC20(tokenA).safeApprove(UNISWAP_ROUTER02_ADDRESS, amountA);
            address[] memory path = new address[](2);
            path[0] = tokenA;
            path[1] = CETH;
            uint[] memory amounts = routers02[UNISWAP_ROUTER02_ADDRESS]
                .swapExactTokensForTokens(
                    amountA,
                    0,
                    path,
                    address(this),
                    block.timestamp
                );
            amountETH += amounts[1];
        }
    }

    function swapFromETHToToken(
        uint256 amountETHToA,
        address tokenA
    ) internal returns (uint256 amountA) {
        if (tokenA != CETH) {
            IERC20(CETH).safeApprove(UNISWAP_ROUTER02_ADDRESS, amountETHToA);
            address[] memory path = new address[](2);
            path[0] = CETH;
            path[1] = tokenA;
            uint[] memory amounts = routers02[UNISWAP_ROUTER02_ADDRESS]
                .swapExactTokensForTokens(
                    amountETHToA,
                    0,
                    path,
                    address(this),
                    block.timestamp
                );

            amountA = amounts[1];
        } else {
            amountA = amountETHToA;
        }
    }

    function swapFromETHToTokens(
        uint256 amountETHToA,
        address tokenA,
        uint256 amountETHToB,
        address tokenB
    ) internal returns (uint256 amountA, uint256 amountB) {
        if (tokenA != CETH) {
            IERC20(CETH).safeApprove(UNISWAP_ROUTER02_ADDRESS, amountETHToA);
            address[] memory path = new address[](2);
            path[0] = CETH;
            path[1] = tokenA;
            uint[] memory amounts = routers02[UNISWAP_ROUTER02_ADDRESS]
                .swapExactTokensForTokens(
                    amountETHToA,
                    0,
                    path,
                    address(this),
                    block.timestamp
                );

            amountA = amounts[1];
        } else {
            amountA = amountETHToA;
        }

        if (tokenB != CETH) {
            IERC20(CETH).safeApprove(UNISWAP_ROUTER02_ADDRESS, amountETHToB);
            address[] memory path = new address[](2);
            path[0] = CETH;
            path[1] = tokenB;
            uint[] memory amounts = routers02[UNISWAP_ROUTER02_ADDRESS]
                .swapExactTokensForTokens(
                    amountETHToB,
                    0,
                    path,
                    address(this),
                    block.timestamp
                );

            amountB = amounts[1];
        } else {
            amountB = amountETHToB;
        }
    }

    function transferLiquidityToOwner(
        address pair,
        uint256 liquidity
    ) internal {
        IERC20(pair).safeTransfer(msg.sender, liquidity);
    }

    function swapLP(
        RemoveLPParams memory removeParams,
        AddLPParams memory addParams
    ) public returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        // Remove liquidity
        (uint256 amountARemoved, uint256 amountBRemoved) = removeLiquidity(
            removeParams
        );
        // Swap from removed token to ETH
        uint256 amountETH = swapFromTokensToETH(
            amountARemoved,
            removeParams.tokenA,
            amountBRemoved,
            removeParams.tokenB
        );
        // Swap from ETH to add token;
        (uint256 amountAToAdd, uint256 amountBToAdd) = swapFromETHToTokens(
            amountETH / 2,
            addParams.tokenA,
            amountETH / 2,
            addParams.tokenB
        );
        // Add liquidity
        (amountA, amountB, liquidity) = addLiquidity(
            AddLPParams(
                addParams.tokenA,
                addParams.tokenB,
                amountAToAdd,
                amountBToAdd,
                addParams.amountAMin,
                addParams.amountBMin,
                address(this),
                block.timestamp
            )
        );

        // Transfer liquidity to user
        address pair = IUniswapV2Factory(FACTORY).getPair(
            addParams.tokenA,
            addParams.tokenB
        );
        transferLiquidityToOwner(pair, liquidity);
    }

    function addLPFromToken(address tokenIn, uint256 amountIn, AddLPParams memory addParams) public returns (uint256 amountA, uint256 amountB, uint256 liquidity) {
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);

        // swap from token to ETH
        uint256 amountETH = swapFromTokenToETH(amountIn, tokenIn);

        // swap from ETH to token
        (uint256 amountAToAdd, uint256 amountBToAdd) = swapFromETHToTokens(
            amountETH / 2,
            addParams.tokenA,
            amountETH / 2,
            addParams.tokenB
        );

        // Add liquidity
        (amountA, amountB, liquidity) = addLiquidity(
            AddLPParams(
                addParams.tokenA,
                addParams.tokenB,
                amountAToAdd,
                amountBToAdd,
                addParams.amountAMin,
                addParams.amountBMin,
                address(this),
                block.timestamp
            )
        );

        // Transfer liquidity to user
        address pair = IUniswapV2Factory(FACTORY).getPair(
            addParams.tokenA,
            addParams.tokenB
        );
        transferLiquidityToOwner(pair, liquidity);
    }

    function removeLPToToken(RemoveLPParams memory removeParams, address tokenOut, uint256 amountOutMin) public returns (uint256 amountOut) {
        (uint256 amountA, uint256 amountB) = removeLiquidity(removeParams);

        // swap from token to ETH
        uint256 amountETH = swapFromTokensToETH(
            amountA,
            removeParams.tokenA,
            amountB,
            removeParams.tokenB
        );

        // swap from ETH to token
        amountOut = swapFromETHToToken(
            amountETH,
            tokenOut
        );

        require(amountOut >= amountOutMin, "LPAggreator: INSUFFICIENT_OUTPUT_AMOUNT");

        IERC20(tokenOut).safeTransfer(msg.sender, amountOut);
    }
}
