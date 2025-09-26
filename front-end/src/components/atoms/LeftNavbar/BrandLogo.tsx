import Link from 'next/link';

interface BrandLogoProps {
  onClick?: () => void;
}

const BrandLogo = ({ onClick }: BrandLogoProps) => {
  return (
    <Link
      href="/"
      aria-label="Go to Home"
      onClick={(e) => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <img src="/images/insite-logo-bl.png" alt="Brand Logo" width={100} height={100} />
    </Link>
  );
}

export default BrandLogo;