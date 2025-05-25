import { useState, useEffect } from 'react';
import { Outlet } from "react-router";
import Navbar from '../components/Navbar';
import MobNavbar from '../components/MobileNavbar';
import SideBar from '../components/SideBar';
import Footer from '../components/Footer';

function HomeLayout() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <>
    <div className="flex">
      <SideBar initialCollapsed = {isMobile}/>
      <div className="w-full mx-auto">
        {isMobile ? <MobNavbar isLoggedIn={false} /> : <Navbar isLoggedIn={false} />}
        <Outlet/>
        <Footer/>
      </div>
    </div>
    </>
  );
}

export default HomeLayout;
