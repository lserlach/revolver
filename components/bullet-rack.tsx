"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import styles from "./bullet-rack.module.css";

interface BulletRackProps {
  usedChambers: boolean[];
  isSpinning: boolean;
  spinId: number;
}

function Bullet({ used, index }: { used: boolean; index: number }) {
  return (
    <div
      className={`${styles.slot} ${used ? styles.spent : ""}`}
      style={{ "--angle": `${index * 60}deg` } as CSSProperties}
    >
      <span className={styles.chamber} aria-hidden="true">
        {used ? null : <span className={styles.slug} />}
      </span>
    </div>
  );
}

export function BulletRack({ usedChambers, isSpinning, spinId }: BulletRackProps) {
  const [angle, setAngle] = useState(0);
  const restAngleRef = useRef(0);

  useEffect(() => {
    restAngleRef.current = 0;
    setAngle(0);
  }, [spinId]);

  useEffect(() => {
    if (!isSpinning) {
      return;
    }

    const nextAngle = restAngleRef.current + 720 + 60;
    restAngleRef.current = nextAngle;
    setAngle(nextAngle);
  }, [isSpinning]);

  return (
    <div className={styles.rack} aria-label="Барабан" role="img">
      <div
        className={styles.rotor}
        style={{ transform: `rotate(${angle}deg)` }}
      >
        <span className={styles.hub} aria-hidden="true" />
        {usedChambers.map((used, index) => (
          <Bullet key={index} used={used} index={index} />
        ))}
      </div>
    </div>
  );
}
