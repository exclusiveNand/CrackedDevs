import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home/Home";
import Swap from "./pages/Swap/Swap";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import Pools from "./pages/Pools/Pools";
import Add from "./pages/Add/Add";

const FullLayout = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
      <Footer />
    </div>
  );
};

const HeaderLayout = ({ children }) => {
  return (
    <div>
      <Header />
      {children}
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/swap",
    element: <HeaderLayout>{<Pools />}</HeaderLayout>,
  },
  {
    path: "/swap/:poolPair",
    element: <HeaderLayout>{<Swap />}</HeaderLayout>,
  },
  {
    path: "/AddPool",
    element: <HeaderLayout>{<Add />}</HeaderLayout>,
  },
  // {
  //   path: "/pool",
  //   element: <FullLayout>{<Pool />}</FullLayout>,
  // }
  {
    path: "*",
    element: <div>404</div>,
  },
]);

export default router;
