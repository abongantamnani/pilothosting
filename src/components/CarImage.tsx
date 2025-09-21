import React, { useEffect, useRef } from "react";

interface CarImageProps {
  motion: { x: number[]; y: number[]; z: number[] };
  gpsSpeed: number;
}

export default function CarImage({ motion, gpsSpeed }: CarImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (imgRef.current && gpsSpeed > 0) {
        const lastIndex = motion.x.length - 1;
        imgRef.current.style.transform = `
          rotateX(${motion.x[lastIndex] * 10}deg)
          rotateY(${motion.y[lastIndex] * 10}deg)
          rotateZ(${motion.z[lastIndex] * 10}deg)
        `;
      }
    }, 100); // updates every 100ms

    return () => clearInterval(interval);
  }, [motion, gpsSpeed]);

  return (
    <div className="w-full h-full flex items-center justify-center">
      <img
        ref={imgRef}
        src="/images/car.png"
        alt="Car"
        className="w-32 h-auto transition-transform duration-100"
      />
    </div>
  );
}
