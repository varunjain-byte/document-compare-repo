'use client';

import cx from 'classnames';

interface LogoProps {
  includeBrandName?: boolean;
  hasCustomLogo?: boolean;
  style?: 'default' | 'grayscale' | 'coral';
  className?: string;
  darkModeEnabled?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  includeBrandName = true,
  className,
}) => {
  return (
    <img
      src="/images/zf-logo.png"
      alt="ZF Logo"
      className={cx('h-full', { 'w-24': includeBrandName, 'w-12': !includeBrandName }, className)}
    />
  );
};
