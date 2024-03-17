import { useState } from "react";

const useModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [changeToken, setChangeToken] = useState("tokenA");

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = (asset) => {
    setChangeToken(asset);
    setIsOpen(true);
  };

  return {
    isOpen,
    closeModal,
    openModal,
    changeToken,
  };
};

export default useModal;
