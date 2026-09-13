import React from 'react';
import { Link } from 'react-router-dom';
import logoAsset from '../assets/mi-profesionalya-logo-exact.png';

const Logo = ({ variant = 'horizontal', tone = 'dark', className = '' }) => {
  const isLight = tone === 'light';
  const imgClass = variant === 'horizontal'
    ? 'h-[80px] w-auto sm:h-[88px] md:h-[96px] object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]'
    : 'h-[52px] w-auto object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]';

  return (
    <Link to="/" className={`inline-flex items-center ${className}`} aria-label="MiProfesionalYa home">
      <img
        src={logoAsset}
        alt="MiProfesionalYa"
        className={imgClass}
        draggable={false}
        style={{ filter: isLight ? 'brightness(1.08)' : 'none' }}
      />
    </Link>
  );
};

export const LogoIcon = ({ size = 36 }) => (
  <img src={logoAsset} alt="MiProfesionalYa" width={size} height={size} className="object-contain" draggable={false} />
);

export const LogoWhite = () => (
  <img src={logoAsset} alt="MiProfesionalYa" className="h-[58px] w-auto object-contain" draggable={false} />
);

export default Logo;
