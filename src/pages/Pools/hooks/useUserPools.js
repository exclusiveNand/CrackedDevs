import axios from "axios";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const useUserPools = () => {
  const { address } = useAccount();
  const [userPoolsList, setUserPoolsList] = useState([]);

  useEffect(() => {
    if (address) {
      const getUserPoolsList = async () => {
        try {
          const response = await axios.get(
            import.meta.env.VITE_API_ENDPOINT + `/getUserPool`,
            {
              params: {
                walletAddress: address,
              },
            }
          );
          console.log(response);
          setUserPoolsList(response.data.pools);
        } catch (error) {
          console.error("Error getting user pools list: ", error);
          setUserPoolsList([]);
        }
      };

      getUserPoolsList();

      const interval = setInterval(() => {
        getUserPoolsList();
      }, 60000);

      return () => clearInterval(interval);
    }

    if (!address) {
      setUserPoolsList([]);
    }
  }, [address]);

  return { userPoolsList };
};

export default useUserPools;
