import { Outlet } from "react-router";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function HomeLayout() {

  return (
    <>
        <Navbar/>
      <div className="pt-20">
        <Outlet/>
        <Footer/>
      </div>
    </>
  );
}

export default HomeLayout;
