import Spline from '@splinetool/react-spline';
import { ReactNode } from 'react';
import { useEffect } from 'react';

interface SplineSceneProps {
  children?: ReactNode;
}

const SplineScene = ({ children }: SplineSceneProps) => {
  const link = "https://prod.spline.design/z4-sDb4Ub0RSMCAa/scene.splinecode";

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <Spline 
        scene={link} 
        onLoad={(spline) => {
          // You can access and control the 3D element here
          console.log('Spline loaded:', spline);
        }}
        onMouseDown={(e) => {
          // Example: Handle mouse down events
          console.log('Mouse down event:', e);
        }}
      />
      <div style={{ pointerEvents:'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%'}}>
        {children}
      </div>
    </div>
  );
};
export default SplineScene;