import "./Home.scss";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return <div onClick={() => navigate("/swap")}>Home</div>;
};

export default Home;
