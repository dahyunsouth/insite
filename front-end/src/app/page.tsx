import KakaoMap from '@/components/map/KakaoMap';
import LoginForm from '@/components/molecules/LoginForm';
import SocialLogin from '@/components/molecules/SocialLogin';
import LoginOrganism from '@/components/organisms/Login';

export default function HomePage() {
  return (
    <div className="relative">
      {/* <KakaoMap /> */}
      {/* <LoginForm /> */}
      {/* <SocialLogin /> */}
      <LoginOrganism />
    </div>
  );
}