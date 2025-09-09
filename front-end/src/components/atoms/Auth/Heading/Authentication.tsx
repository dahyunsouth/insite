interface PageTitleProps {
  type: 'login' | 'signup';
  onBackClick?: () => void;
}

const AuthenticationLabel: React.FC<PageTitleProps> = ({ type, onBackClick }) => {
  const titleText = type === 'login' ? 'Hello,\nFounder!' : 'Join\nin/site';
  const textAlignment = type === 'login' ? 'text-left' : 'text-right';
  
  return (
    <div className="relative">
      {type === 'signup' && (
        <button
          onClick={onBackClick}
          className="absolute left-0 top-0 p-2 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors duration-150"
          aria-label="뒤로가기"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
      )}
      <h1 
        className={`text-[50px] font-extrabold whitespace-pre-line ${textAlignment}`}
        style={{ color: '#3288FF' }}
      >
        {titleText}
      </h1>
    </div>
  );
};

export default AuthenticationLabel;