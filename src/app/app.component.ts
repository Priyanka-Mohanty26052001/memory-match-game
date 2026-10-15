import { Component, OnDestroy } from '@angular/core';

interface GameCard {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  private readonly emojis = [
    '🍓', '🧸', '🌷', '🦋',
    '🍒', '🐰', '🌈', '🍰'
  ];

  cards: GameCard[] = [];
  moves = 0;
  matchedPairs = 0;
  seconds = 0;
  busy = false;
  gameWon = false;

  private timerId?: ReturnType<typeof setInterval>;
  private matchTimeout?: ReturnType<typeof setTimeout>;
  private started = false;

  get formattedTime(): string {
    const minutes = Math.floor(this.seconds / 60);
    const remainingSeconds = this.seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      remainingSeconds
    ).padStart(2, '0')}`;
  }

  constructor() {
    this.restartGame();
  }

  flipCard(index: number): void {
    const card = this.cards[index];

    if (
      this.busy ||
      this.gameWon ||
      card.flipped ||
      card.matched
    ) {
      return;
    }

    this.startTimer();
    card.flipped = true;

    const flippedCards = this.cards.filter(
      item => item.flipped && !item.matched
    );

    if (flippedCards.length === 2) {
      this.moves++;

      const [first, second] = flippedCards;

      if (first.emoji === second.emoji) {
        first.matched = true;
        second.matched = true;
        this.matchedPairs++;

        if (this.matchedPairs === this.emojis.length) {
          this.gameWon = true;
          this.stopTimer();
        }
      } else {
        this.busy = true;

        this.matchTimeout = setTimeout(() => {
          first.flipped = false;
          second.flipped = false;
          this.busy = false;
          this.matchTimeout = undefined;
        }, 800);
      }
    }
  }

  restartGame(): void {
    this.stopTimer();

    if (this.matchTimeout) {
      clearTimeout(this.matchTimeout);
      this.matchTimeout = undefined;
    }

    this.cards = [...this.emojis, ...this.emojis]
      .map((emoji, index) => ({
        id: index,
        emoji,
        flipped: false,
        matched: false
      }))
      .sort(() => Math.random() - 0.5);

    this.moves = 0;
    this.matchedPairs = 0;
    this.seconds = 0;
    this.busy = false;
    this.gameWon = false;
    this.started = false;
  }

  private startTimer(): void {
    if (this.started) {
      return;
    }

    this.started = true;

    this.timerId = setInterval(() => {
      this.seconds++;
    }, 1000);
  }

  private stopTimer(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();

    if (this.matchTimeout) {
      clearTimeout(this.matchTimeout);
    }
  }
}