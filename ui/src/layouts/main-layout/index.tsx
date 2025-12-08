import { Outlet } from "react-router-dom";
import AppErrorSnackbar from "../../components/shared/AppErrorSnackbar";

const MainLayout = () => {
  return (
    <>
      {/* header / sidebar here */}

      <Outlet />

      <AppErrorSnackbar />
    </>
  );
};

export default MainLayout;
