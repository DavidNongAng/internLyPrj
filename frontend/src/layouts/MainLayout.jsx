//This is the main layout of all the pages. It will have the navigation bar.
import { Outlet} from 'react-router-dom'; //Outlet is a component that is used to render the child routes within the parent route. 
import NavBar from '../components/Navbar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const MainLayout = () => {
  return (
    <>
        <NavBar />
        <Outlet />
        <ToastContainer />
    </>
  )
}

export default MainLayout