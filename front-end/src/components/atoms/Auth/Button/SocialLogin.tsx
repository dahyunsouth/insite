import React from 'react';

interface SocialLoginProps {
  provider: 'google' | 'kakao' | 'naver' | 'ssafy';
  onClick: (provider: string) => void;
  disabled?: boolean;
}

const socialConfigs = {
  google: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
    logo: 'https://developers.google.com/identity/images/g-logo.png',
    text: 'Google 로그인'
  },
  ssafy: {
    backgroundColor: '#00BAF7',
    textColor: '#FFFFFF',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiByeD0iNCIgZmlsbD0iIzAwMDAwMCIvPgo8dGV4dCB4PSIxMiIgeT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCIgZm9udC13ZWlnaHQ9ImJvbGQiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TPC90ZXh0Pgo8L3N2Zz4K',
    text: 'SSAFY 로그인'
  }
};

const SocialLogin: React.FC<SocialLoginProps> = ({ 
  provider, 
  onClick, 
  disabled = false 
}) => {
  const config = socialConfigs[provider];

  const handleClick = () => {
    console.log(`${provider} 로그인 클릭됨`);
    onClick(provider);
  };

  return (
    <button 
      className="w-[320px] h-[60px] px-[20px] py-0 rounded-[15px] border border-[#D9D9D9] flex items-center justify-center gap-[12px] text-[20px] font-normal cursor-pointer disabled:bg-gray-400 disabled:cursor-not-allowed"
      style={{ 
        backgroundColor: disabled ? '#f5f5f5' : config.backgroundColor,
        color: disabled ? '#999' : config.textColor
      }}
      onClick={handleClick}
      disabled={disabled}
    >
      <img 
        src={config.logo} 
        alt={`${provider} logo`} 
        className="w-[20px] h-[20px]"
        style={{ opacity: disabled ? 0.5 : 1 }}
      />
      <span>{config.text}</span>
    </button>
  );
};

export default SocialLogin;