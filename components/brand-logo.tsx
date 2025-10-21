import Image from 'next/image';
import { cn } from '@/lib/utils';
import { StreamingService } from '@/lib/types';

const brandConfig = {
  spotify: {
    primary: '/spotify/Spotify_Primary_Logo_RGB_Green.png',
    secondary: '/spotify/Spotify_Full_Logo_RGB_Green.png',
    white: '/spotify/Spotify_Primary_Logo_RGB_White.png',
    black: '/spotify/Spotify_Primary_Logo_RGB_Black.png',
  },
  'apple-music': {
    primary: '/apple-music/Apple_Music_Icon_RGB_lg_073120.svg',
    secondary: '/apple-music/Apple_Music_Icon_RGB_sm_073120.svg',
  },
  soundcloud: {
    primary: '/soundcloud/soundcloud_cloudmark-black.png',
    secondary: '/soundcloud/soundcloud_cloudmark-white.png',
    white: '/soundcloud/soundcloud_cloudmark-white.png',
    black: '/soundcloud/soundcloud_cloudmark-black.png',
    transparent: '/soundcloud/soundcloud_cloudmark-white-transparent.png',
  },
};

export interface BrandLogoProps {
  brand: StreamingService;
  variant?: 'primary' | 'secondary' | 'white' | 'black' | 'transparent';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  alt?: string;
}

const sizeConfig = {
  sm: { width: 24, height: 24 },
  md: { width: 32, height: 32 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 },
};

export function BrandLogo({ 
  brand, 
  variant = 'primary', 
  size = 'md', 
  className,
  alt 
}: BrandLogoProps) {
  const logoPath = brandConfig[brand]?.[variant as keyof typeof brandConfig[typeof brand]];
  
  const dimensions = sizeConfig[size];
  const defaultAlt = alt || `${brand} logo`;

  return (
    <Image
      src={logoPath as string}
      alt={defaultAlt}
      width={dimensions.width}
      height={dimensions.height}
      className={cn('object-contain', className)}
      priority={false}
    />
  );
}

// Convenience components for each brand
export function SpotifyLogo({ variant = 'primary', size = 'md', className, alt }: Omit<BrandLogoProps, 'brand'>) {
  return <BrandLogo brand="spotify" variant={variant} size={size} className={className} alt={alt} />;
}

export function AppleMusicLogo({ variant = 'primary', size = 'md', className, alt }: Omit<BrandLogoProps, 'brand'>) {
  return <BrandLogo brand="apple-music" variant={variant} size={size} className={className} alt={alt} />;
}

export function SoundCloudLogo({ variant = 'primary', size = 'md', className, alt }: Omit<BrandLogoProps, 'brand'>) {
  return <BrandLogo brand="soundcloud" variant={variant} size={size} className={className} alt={alt} />;
}
