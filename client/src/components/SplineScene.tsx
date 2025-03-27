import Spline from '@splinetool/react-spline';

const SplineScene = () => {
  const link = "https://prod.spline.design/z4-sDb4Ub0RSMCAa/scene.splinecode"
  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Spline scene={link} />
    </div>
  );
};

export default SplineScene;