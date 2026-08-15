"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./bullet-rack.module.css";

interface BulletRackProps {
  loadedChambers: boolean[];
  isSpinning: boolean;
  spinId: number;
}

function Bullet({ loaded, index, step }: { loaded: boolean; index: number; step: number }) {
  return (
    <div
      className={`${styles.slot} ${loaded ? "" : styles.empty}`}
      style={{ "--angle": `${index * step}deg` } as CSSProperties}
    >
      <span className={styles.chamber} aria-hidden="true">
        {loaded ? <span className={styles.slug} /> : null}
      </span>
    </div>
  );
}

export function BulletRack({ loadedChambers, isSpinning, spinId }: BulletRackProps) {
  const [angle, setAngle] = useState(0);
  const restAngleRef = useRef(0);
  const step = 360 / Math.max(loadedChambers.length, 1);

  useEffect(() => {
    restAngleRef.current = 0;
    setAngle(0);
  }, [spinId, loadedChambers.length]);

  useEffect(() => {
    if (!isSpinning) {
      return;
    }

    const nextAngle = restAngleRef.current + 720 + step;
    restAngleRef.current = nextAngle;
    setAngle(nextAngle);
  }, [isSpinning, step]);

  return (
    <div
      className={`${styles.rack} ${loadedChambers.length === 8 ? styles.wide : ""}`}
      aria-label="Барабан"
      role="img"
    >
      <div className={styles.rotor} style={{ transform: `rotate(${angle}deg)` }}>
        <span className={styles.hub} aria-hidden="true" />
        {loadedChambers.map((loaded, index) => (
          <Bullet key={index} loaded={loaded} index={index} step={step} />
        ))}
      </div>
    </div>
  );
}
