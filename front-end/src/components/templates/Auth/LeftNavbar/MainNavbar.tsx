import FirstLeftNavbar from '@/components/organisms/LeftNavbar/FirstLeftNavbar';
import SecondLeftNavbar from '@/components/organisms/LeftNavbar/SecondLeftNavbar';
import ThirdLeftNavbar from '@/components/organisms/LeftNavbar/ThirdLeftNavbar';

const MainNavbar = () => {
  return (
    <nav className="w-1/4 pt-2 pl-2 space-y-1">
      <FirstLeftNavbar />
      <SecondLeftNavbar />
      <ThirdLeftNavbar />
    </nav>
  );
}

export default MainNavbar;


