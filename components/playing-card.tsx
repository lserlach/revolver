import type { CardRank, CardSuit } from "@/lib/poker-hands";
import styles from "./playing-card.module.css";

const SUIT_MARK: Record<CardSuit, string> = {
  hearts: "♥",
  diamonds: "♦",
  clubs: "♣",
  spades: "♠",
};

interface PlayingCardProps {
  rank: CardRank;
  suit: CardSuit;
  dimmed?: boolean;
}

export function PlayingCard({ rank, suit, dimmed = false }: PlayingCardProps) {
  const isRed = suit === "hearts" || suit === "diamonds";

  return (
    <span
      className={`${styles.card} ${isRed ? styles.red : styles.black} ${dimmed ? styles.dimmed : ""}`}
      aria-hidden="true"
    >
      <span className={`${styles.rank} ${rank === "10" ? styles.ten : ""}`}>{rank}</span>
      <span className={styles.suit}>{SUIT_MARK[suit]}</span>
    </span>
  );
}
