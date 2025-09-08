import Link from 'next/link';

const BrandLogo = () => {
  return (
    <Link href="/" aria-label="Go to Home">
      <img src="/images/Location.svg" alt="Brand Logo" />
    </Link>
  );
}

export default BrandLogo;