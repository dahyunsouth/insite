import Link from 'next/link';

const BrandLogo = () => {
  return (
    <Link href="/" aria-label="Go to Home">
      <img src="/images/insite-logo-wh.png" alt="Brand Logo" width={100} height={100} />
    </Link>
  );
}

export default BrandLogo;