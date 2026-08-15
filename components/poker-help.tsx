"use client";

import { POKER_HANDS } from "@/lib/poker-hands";
import { PlayingCard } from "./playing-card";
import styles from "./poker-help.module.css";

interface PokerHelpProps {
  onClose: () => void;
}

export function PokerHelp({ onClose }: PokerHelpProps) {
  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="poker-help-title"
      onClick={onClose}
    >
      <div
        className={styles.sheet}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <header className={styles.header}>
          <div>
            <h2 id="poker-help-title" className={styles.title}>
              Комбинации покера
            </h2>
            <p className={styles.hint}>1 — самая сильная, дальше слабее</p>
          </div>
          <button className={styles.close} type="button" onClick={onClose} aria-label="Закрыть">
            Закрыть
          </button>
        </header>

        <ol className={styles.list}>
          {POKER_HANDS.map((hand, index) => (
            <li key={hand.name} className={styles.item}>
              <span className={styles.rank}>{index + 1}</span>
              <div className={styles.copy}>
                <p className={styles.name}>{hand.name}</p>
                <p className={styles.text}>{hand.text}</p>
              </div>
              <div className={styles.cards} aria-hidden="true">
                {hand.cards.map((card, index) => (
                  <PlayingCard
                    key={`${hand.name}-${card.rank}-${card.suit}-${index}`}
                    rank={card.rank}
                    suit={card.suit}
                    dimmed={card.dimmed}
                  />
                ))}
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
