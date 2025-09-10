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
          className="absolute left-0 top-0 pt-6 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors duration-150 cursor-pointer"
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
            <path d="M15 18l-6-6 6-6"/>
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