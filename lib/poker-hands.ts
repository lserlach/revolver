export type CardSuit = "hearts" | "diamonds" | "clubs" | "spades";
export type CardRank = "A" | "K" | "Q" | "J" | "10" | "9" | "8" | "7" | "6" | "5" | "4" | "3" | "2";

export interface PokerCard {
  rank: CardRank;
  suit: CardSuit;
  dimmed?: boolean;
}

export interface PokerHand {
  name: string;
  text: string;
  cards: PokerCard[];
}

export const POKER_HANDS: PokerHand[] = [
  {
    name: "Флеш рояль",
    text: "Туз, король, дама, валет и десятка одной масти",
    cards: [
      { rank: "10", suit: "hearts" },
      { rank: "J", suit: "hearts" },
      { rank: "Q", suit: "hearts" },
      { rank: "K", suit: "hearts" },
      { rank: "A", suit: "hearts" },
    ],
  },
  {
    name: "Стрит флеш",
    text: "5 последовательных одномастных карт",
    cards: [
      { rank: "7", suit: "clubs" },
      { rank: "8", suit: "clubs" },
      { rank: "9", suit: "clubs" },
      { rank: "10", suit: "clubs" },
      { rank: "J", suit: "clubs" },
    ],
  },
  {
    name: "Каре",
    text: "4 карты одного ранга",
    cards: [
      { rank: "K", suit: "spades" },
      { rank: "K", suit: "diamonds" },
      { rank: "K", suit: "clubs" },
      { rank: "K", suit: "hearts" },
      { rank: "3", suit: "diamonds", dimmed: true },
    ],
  },
  {
    name: "Фулл-хауз",
    text: "Три карты одного ранга и две карты другого ранга",
    cards: [
      { rank: "6", suit: "spades" },
      { rank: "6", suit: "diamonds" },
      { rank: "6", suit: "clubs" },
      { rank: "10", suit: "clubs" },
      { rank: "10", suit: "hearts" },
    ],
  },
  {
    name: "Флеш",
    text: "Пять карт одной масти",
    cards: [
      { rank: "J", suit: "spades" },
      { rank: "7", suit: "spades" },
      { rank: "A", suit: "spades" },
      { rank: "2", suit: "spades" },
      { rank: "9", suit: "spades" },
    ],
  },
  {
    name: "Стрит",
    text: "Пять последовательных по рангу карт (масть не имеет значения)",
    cards: [
      { rank: "5", suit: "diamonds" },
      { rank: "6", suit: "clubs" },
      { rank: "7", suit: "spades" },
      { rank: "8", suit: "hearts" },
      { rank: "9", suit: "diamonds" },
    ],
  },
  {
    name: "Тройка (Трипс)",
    text: "Три карты одного ранга",
    cards: [
      { rank: "J", suit: "hearts" },
      { rank: "J", suit: "clubs" },
      { rank: "J", suit: "diamonds" },
      { rank: "6", suit: "spades", dimmed: true },
      { rank: "A", suit: "diamonds", dimmed: true },
    ],
  },
  {
    name: "Две пары",
    text: "Две карты одного ранга + две карты другого ранга",
    cards: [
      { rank: "9", suit: "clubs" },
      { rank: "9", suit: "spades" },
      { rank: "10", suit: "clubs" },
      { rank: "10", suit: "hearts" },
      { rank: "3", suit: "diamonds", dimmed: true },
    ],
  },
  {
    name: "Пара",
    text: "Две карты одного ранга",
    cards: [
      { rank: "J", suit: "clubs" },
      { rank: "J", suit: "hearts" },
      { rank: "A", suit: "spades", dimmed: true },
      { rank: "2", suit: "diamonds", dimmed: true },
      { rank: "7", suit: "hearts", dimmed: true },
    ],
  },
  {
    name: "Старшая карта",
    text: "Когда нет комбинации, побеждает игрок с более сильной старшей картой",
    cards: [
      { rank: "K", suit: "clubs" },
      { rank: "9", suit: "spades", dimmed: true },
      { rank: "3", suit: "clubs", dimmed: true },
      { rank: "7", suit: "hearts", dimmed: true },
      { rank: "J", suit: "diamonds", dimmed: true },
    ],
  },
];
