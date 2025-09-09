interface PageTitleProps {
  type: 'login' | 'signup';
}

const AuthenticationLabel: React.FC<PageTitleProps> = ({ type }) => {
  const titleText = type === 'login' ? 'Hello,\nFounder!' : 'Join\nin/site';
  const textAlignment = type === 'login' ? 'text-left' : 'text-right';
  
  return (
    <h1 
      className={`text-[50px] font-extrabold whitespace-pre-line ${textAlignment}`}
      style={{ color: '#3288FF' }}
    >
      {titleText}
    </h1>
  );
};

export default AuthenticationLabel;