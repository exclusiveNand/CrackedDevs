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
    address public constant CFX = 0x2ED3dddae5B2F321AF0806181FBFA6D049Be47d8;
    address public constant USDT = 0x7d682e65EFC5C13Bf4E394B8f376C48e6baE0355;
    address public constant USDC = 0x349298B0E20DF67dEFd6eFb8F3170cF4a32722EF;
    address public constant FAUCET_ETH =
        0xcD71270F82f319E0498FF98AF8269C3f0D547c65;
    address public constant FAUCET_BTC =
        0x54593e02c39aEFf52B166bd036797D2b1478de8D;
    address public constant WALLET_ADDRESS =
        0x9f05e3f61a93af744112fBAa880b1aF8e1935fb8;

    address private constant UNISWAP_ROUTER02_ADDRESS =
        0x873789aaF553FD0B4252d0D2b72C6331c47aff2E;
    IUniswapV2Router02 private constant uniswapRouter =
        IUniswapV2Router02(UNISWAP_ROUTER02_ADDRESS);
    address private constant FACTORY =
        0x36B83E0D41D1dd9C73a006F0c1cbC1F096E69E34;

    LPAggreator lpAggreator = new LPAggreator();

    IERC20 private constant cfx = IERC20(CFX);
    IERC20 private constant usdt = IERC20(USDT);
    IERC20 private constant usdc = IERC20(USDC);

    uint256 private liquidity = 0;

    function setUp() public payable {
        vm.startBroadcast(WALLET_ADDRESS);
        IERC20(USDT).safeApprove(UNISWAP_ROUTER02_ADDRESS, 5 * 1e18);
        address[] memory path = new address[](2);
        path[0] = USDT;
        path[1] = CFX;
        uint[] memory amount = uniswapRouter.swapExactTokensForTokens(
            5 * 1e18,
            0,
            path,
            WALLET_ADDRESS,
            block.timestamp
        );
        console.log(amount[0]);
        console.log(amount[1]);
        console.log("CFX  balance", cfx.balanceOf(WALLET_ADDRESS));
        console.log("USDT balance", usdt.balanceOf(WALLET_ADDRESS));

        console.log("--------------------");
        uint256 amountAToAdd = 10 * 1e18;
        uint256 amountBToAdd = 10 * 1e18;
        IERC20 pair = IERC20(IUniswapV2Factory(FACTORY).getPair(CFX, USDT));
        console.log("pair address: %s", address(pair));
        usdt.safeApprove(UNISWAP_ROUTER02_ADDRESS, 0);
        cfx.safeApprove(UNISWAP_ROUTER02_ADDRESS, 0);
        // Approve uni for transferring
        usdt.safeApprove(UNISWAP_ROUTER02_ADDRESS, amountAToAdd);
        cfx.safeApprove(UNISWAP_ROUTER02_ADDRESS, amountBToAdd);

        (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidityMinted
        ) = uniswapRouter.addLiquidity(
                CFX,
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
        vm.stopBroadcast();
    }

    function testSwapLP() public {
        vm.startBroadcast(WALLET_ADDRESS);
        IERC20 pair = IERC20(IUniswapV2Factory(FACTORY).getPair(CFX, USDT));
        console.log("--------------------");
        console.log("pair balance: %s", pair.balanceOf(address(this)));

        LPAggreator.RemoveLPParams memory removeParams = LPAggreator
            .RemoveLPParams(
                USDT,
                CFX,
                liquidity / 10,
                0,
                0,
                WALLET_ADDRESS,
                block.timestamp
            );
        LPAggreator.AddLPParams memory addParams = LPAggreator.AddLPParams(
            FAUCET_ETH,
            FAUCET_BTC,
            0,
            0,
            0,
            0,
            WALLET_ADDRESS,
            block.timestamp
        );
        IERC20(pair).safeApprove(address(lpAggreator), liquidity);
        (
            uint256 amountA,
            uint256 amountB,
            uint256 liquidityMinted
        ) = lpAggreator.swapLP(removeParams, addParams);
        console.log(
            "Swap liquidity success, amountA: %s, amountB: %s, liquidity: %s",
            amountA,
            amountB,
            liquidityMinted
        );
        vm.stopBroadcast();
    }
}
