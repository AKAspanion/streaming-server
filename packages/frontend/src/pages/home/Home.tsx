import { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

function Home() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/") {
      navigate("/video-upload");
    }
  }, [location.pathname]);

  return (
    <div>
      <Outlet />
    </div>
  );
}

export default Home;
