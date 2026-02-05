import { FC } from 'react';

interface IconBuildingProps {
  className?: string;
  fill?: boolean;
  duotone?: boolean;
}

const IconBuilding: FC<IconBuildingProps> = ({ className, fill = false, duotone = true }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path
        opacity={duotone ? '0.5' : '1'}
        d="M20 21L12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path
        d="M12 21V3M20 21V8L12 3L4 8V21M9 10H15M9 14H15M9 18H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
};

export default IconBuilding;
