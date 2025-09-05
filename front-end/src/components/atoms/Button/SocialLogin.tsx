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
  kakao: {
    backgroundColor: '#FFE150',
    textColor: '#000000',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDNDNy4wMzEgMyAzIDYuMzM2IDMgMTAuNUMzIDEzLjI5OCA1LjE4OCAxNS42ODEgOC4yMjYgMTYuNDgxTDcuMjc0IDE5LjgzNUM3LjE0NSAyMC4yNTMgNy42NTIgMjAuNTg5IDggMjAuMzI2TDEyLjA0OSAxNy44NjFDMTIuMDMzIDE3Ljg2MSAxMi4wMTcgMTcuODYxIDEyIDE3Ljg2MUMxNi45NjkgMTcuODYxIDIxIDEzLjE2NCAyMSAxMC41QzIxIDYuMzM2IDE2Ljk2OSAzIDEyIDNaIiBmaWxsPSIjMDAwMDAwIi8+Cjwvc3ZnPgo=',
    text: '카카오 로그인'
  },
  naver: {
    backgroundColor: '#28A745',
    textColor: '#FFFFFF',
    logo: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTAgMEgyNFYyNEgwVjBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMTYuMjczIDIuMTgySDIxLjgxOFYyMS44MThIMTYuMjczVjEzLjA5MUw3LjcyNyAyMS44MThIMi4xODJWMi4xODJINy43MjdWMTAuOTA5TDE2LjI3MyAyLjE4MloiIGZpbGw9IiMyOEE3NDUiLz4KPC9zdmc+Cg==',
    text: '네이버 로그인'
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