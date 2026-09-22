import React, { useRef, useState, useEffect } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

export function ContainerScroll({ titleComponent, children }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.85, 0.98] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0.08, 0.55], [20, 0]);
  const scale = useTransform(scrollYProgress, [0.08, 0.55], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0.08, 0.55], [0, -30]);

  return (
    <div
      className="container-scroll-wrapper"
      ref={containerRef}
      style={{
        position: "relative",
        padding: isMobile ? "1.5rem 0.5rem 3rem" : "2.5rem 1rem 5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
      }}
    >
      <div
        className="container-scroll-inner"
        style={{
          width: "100%",
          maxWidth: "1160px",
          position: "relative",
          perspective: "1200px"
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

export function Header({ translate, titleComponent }) {
  return (
    <motion.div
      style={{
        translateY: translate,
        maxWidth: "960px",
        margin: "0 auto 1.5rem",
        textAlign: "center"
      }}
      className="container-scroll-header"
    >
      {titleComponent}
    </motion.div>
  );
}

export function Card({ rotate, scale, children }) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 16px 36px rgba(0, 0, 0, 0.45), 0 37px 45px rgba(22, 101, 52, 0.28), 0 84px 60px rgba(0, 0, 0, 0.35)",
        transformStyle: "preserve-3d"
      }}
      className="container-scroll-card"
    >
      <div className="container-scroll-card-inner">
        {children}
      </div>
    </motion.div>
  );
}

export default ContainerScroll;
