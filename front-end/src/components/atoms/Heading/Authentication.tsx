interface PageTitleProps {
  type: 'login' | 'signup';
}

const AuthenticationLabel: React.FC<PageTitleProps> = ({ type }) => {
  const titleText = type === 'login' ? 'Hello,\nFounder!' : 'Join,\nin/site';
  
  return (
    <h1 
      className="text-[50px] font-extrabold whitespace-pre-line"
      style={{ color: '#3288FF' }}
    >
      {titleText}
    </h1>
  );
};

export default AuthenticationLabel;