// SPDX-License-Identifier: MIT
pragma solidity 0.6.6;
pragma experimental ABIEncoderV2;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../src/LPAggreator.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/safeERC20.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";
import "@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol";
import "@uniswap/v2-periphery/contracts/interfaces/IUniswapV2Router02.sol";

contract TestLPAggreator is Test {
    using SafeERC20 for IERC20;
    address public constant CETH = 0x2ED3dddae5B2F321AF0806181FBFA6D049Be47d8;
    address public constant USDT = 0x7d682e65EFC5C13Bf4E394B8f376C48e6baE0355;
    address public constant USDC = 0x349298B0E20DF67dEFd6eFb8F3170cF4a32722EF;
    address public constant FAUCET_ETH =
        0xcD71270F82f319E0498FF98AF8269C3f0D547c65;
    address public constant FAUCET_BTC =
        0x54593e02c39aEFf52B166bd036797D2b1478de8D;

    address private constant UNISWAP_ROUTER02_ADDRESS =
        0x873789aaF553FD0B4252d0D2b72C6331c47aff2E;
    IUniswapV2Router02 private constant uniswapRouter =
        IUniswapV2Router02(UNISWAP_ROUTER02_ADDRESS);
    address private constant FACTORY =
        0x36B83E0D41D1dd9C73a006F0c1cbC1F096E69E34;

    LPAggreator lpAggreator = new LPAggreator();

    IERC20 private constant ceth = IERC20(CETH);
    IERC20 private constant usdt = IERC20(USDT);
    IERC20 private constant usdc = IERC20(USDC);

    uint256 private liquidity = 0;

    function addLiquidityForPair(address tokenA, uint256 amountAToAdd, address tokenB, uint256 amountBToAdd) public {
        console.log("--------------------");
        IERC20(tokenA).safeApprove(UNISWAP_ROUTER02_ADDRESS, 0);
        IERC20(tokenB).safeApprove(UNISWAP_ROUTER02_ADDRESS, 0);
        deal(tokenA, address(this), amountAToAdd);
        deal(tokenB, address(this), amountBToAdd);
        // Approve uni for transferring
        IERC20(tokenA).safeApprove(UNISWAP_ROUTER02_ADDRESS, amountAToAdd);
        IERC20(tokenB).safeApprove(UNISWAP_ROUTER02_ADDRESS, amountBToAdd);

        (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidityMinted
        ) = uniswapRouter.addLiquidity(
                tokenA,
                tokenB,
                amountAToAdd,
                amountBToAdd,
                1,
                1,
                address(this),
                block.timestamp
            );

        console.log("Liquidity: %s", liquidityMinted);
        console.log("amountA: %s, amountB: %s", amountA, amountB);
    }

    function setUp() public payable {
        addLiquidityForPair(USDT, 1e6 * 1e18, CETH, 1e6 * 1e18);
        addLiquidityForPair(USDC, 1e6 * 1e18, CETH, 1e6 * 1e18);

        console.log("--------------------");
        uint256 amountAToAdd = 10 * 1e18;
        uint256 amountBToAdd = 10 * 1e18;
        IERC20 pair = IERC20(IUniswapV2Factory(FACTORY).getPair(CETH, USDT));
        console.log("pair address: %s", address(pair));
        usdt.safeApprove(UNISWAP_ROUTER02_ADDRESS, 0);
        ceth.safeApprove(UNISWAP_ROUTER02_ADDRESS, 0);
        deal(USDT, address(this), amountAToAdd);
        deal(CETH, address(this), amountBToAdd);
        // Approve uni for transferring
        usdt.safeApprove(UNISWAP_ROUTER02_ADDRESS, amountAToAdd);
        ceth.safeApprove(UNISWAP_ROUTER02_ADDRESS, amountBToAdd);

        (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidityMinted
        ) = uniswapRouter.addLiquidity(
                CETH,
                USDT,
                amountAToAdd,
                amountBToAdd,
                1,
                1,
                address(this),
                block.timestamp
            );

        liquidity += liquidityMinted;
        console.log("Liquidity: %s", liquidity);
        console.log("amountA: %s, amountB: %s", amountA, amountB);
        console.log("pair balance: %s", pair.balanceOf(address(this)));
        assertGt(pair.balanceOf(address(this)), 0);
    }

    function testSwapLP() public {
        IERC20 pair = IERC20(IUniswapV2Factory(FACTORY).getPair(CETH, USDT));
        console.log("--------------------");
        console.log("pair balance: %s", pair.balanceOf(address(this)));

        LPAggreator.RemoveLPParams memory removeParams = LPAggreator
            .RemoveLPParams(
                USDT,
                CETH,
                liquidity,
                0,
                0,
                address(this),
                block.timestamp
            );
        LPAggreator.AddLPParams memory addParams = LPAggreator.AddLPParams(
            USDC,
            CETH,
            0,
            0,
            0,
            0,
            address(this),
            block.timestamp
        );
        IERC20(pair).safeApprove(address(lpAggreator), liquidity);
        (uint256 amountA, uint256 amountB, uint256 liquidityMinted) = lpAggreator.swapLP(removeParams, addParams);
        console.log('Swap liquidity success, amountA: %s, amountB: %s, liquidity: %s', amountA, amountB, liquidityMinted);
    }

    function testAddLPFromToken() public {
        console.log("--------------------");
        deal(USDC, address(this), 1e6 * 1e18);

        LPAggreator.AddLPParams memory addParams = LPAggreator.AddLPParams(
            USDT,
            CETH,
            0, 
            0,
            0,
            0,
            address(this),
            block.timestamp
        );
        IERC20(USDC).safeApprove(address(lpAggreator), 1e6 * 1e18);
        (uint256 amountA, uint256 amountB, uint256 liquidityMinted) = lpAggreator.addLPFromToken(USDC, 1e6 * 1e18, addParams);
        console.log('Add liquidity success, amountA: %s, amountB: %s, liquidity: %s', amountA, amountB, liquidityMinted);
    }

    function testRemoveLPToToken() public {
        console.log("--------------------");
        IERC20 pair = IERC20(IUniswapV2Factory(FACTORY).getPair(CETH, USDT));
        console.log("pair balance: %s", pair.balanceOf(address(this)));

        LPAggreator.RemoveLPParams memory removeParams = LPAggreator
            .RemoveLPParams(
                USDT,
                CETH,
                liquidity,
                0,
                0,
                address(this),
                block.timestamp
            );
        IERC20(pair).safeApprove(address(lpAggreator), liquidity);
        (uint256 amountOut) = lpAggreator.removeLPToToken(removeParams, FAUCET_ETH, 0);
        console.log('Remove liquidity success, amountOut: %s', amountOut);
    }
}
