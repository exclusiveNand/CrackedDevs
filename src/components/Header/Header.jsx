import "./Header.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { Dropdown } from "antd";
import confluxIcon from "/Conflux.png";
import EthereumIcon from "/Ethereum.png";
import GinpawsIcon from "/logo1024.png";
import { useContext } from "react";
import { ChainContext } from "../../Contexts/ChainContext";
import { SignerContext } from "../../Contexts/SignerContext";
import { useAccount } from "wagmi";

const Header = () => {
  const { activeChain, handleChangeChain } = useContext(ChainContext);

  const { handleConnectButton } = useContext(SignerContext);

  const { status, address } = useAccount();

  const items = [
    {
      label: (
        <div
          className="header__dropdownItem"
          onClick={() => {
            handleChangeChain(71);
          }}
        >
          <img src={confluxIcon} alt="Conflux eSpace (Testnet)" />
          Conflux eSpace (Testnet)
        </div>
      ),
      key: 0,
    },
    {
      label: (
        <div
          className="header__dropdownItem"
          onClick={() => {
            handleChangeChain(5);
          }}
        >
          <img src={EthereumIcon} alt="Goerli Testnet" />
          Goerli Testnet
        </div>
      ),
      key: 1,
    },
    {
      label: (
        <div
          className="header__dropdownItem"
          onClick={() => {
            handleChangeChain(1030);
          }}
        >
          <img src={confluxIcon} alt="Conflux eSpace" />
          Conflux eSpace
        </div>
      ),
      key: 3,
    },
    {
      label: (
        <div
          className="header__dropdownItem"
          onClick={() => {
            handleChangeChain(1);
          }}
        >
          <img src={EthereumIcon} alt="Ethereum Mainet" />
          Ethereum Mainnet
        </div>
      ),
      key: 4,
    },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="header">
      <div className="header__left">
        <img src={GinpawsIcon} alt="logo" />
        <span
          className={location.pathname !== "/pool" ? "selected" : ""}
          onClick={() => {
            navigate("/swap");
          }}
        >
          LP Swap
        </span>
        <span
          className={location.pathname === "/pool" ? "selected" : ""}
          onClick={() => {
            navigate("/pool");
          }}
        >
          Hot Pool
        </span>
      </div>
      <div className="header__right">
        <Dropdown menu={{ items }} className="header__dropdown">
          <div onClick={(e) => e.preventDefault()}>
            <img
              src={window.location.origin + activeChain?.iconURL}
              alt={activeChain?.chainName}
            />
            {activeChain?.chainName}
          </div>
        </Dropdown>
        <div
          className="header__connectBtn"
          onClick={() => {
            handleConnectButton();
          }}
        >
          {status === "connected"
            ? address.slice(0, 4) + "..." + address.slice(38)
            : "Connect"}
        </div>
      </div>
    </div>
  );
};

export default Header;
