export interface ReviewedCard {
    reviewId: number;
    cardId: number;
    usn: number;
    buttonPressed: number;
    newInterval: number;
    previousInterval: number;
    newFactor: number;
    reviewDurationMs: number;
    reviewType: number;
}
