import MiniDrawer from "../components/CustomAppBar";
import { Outlet } from "react-router-dom";

export default function Dashboard() {
  return (
    <>
      <MiniDrawer>
        <Outlet />
      </MiniDrawer>
    </>
  );
}
