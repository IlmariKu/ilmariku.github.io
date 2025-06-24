export interface Exercise {
    id: number;
    title: string;
    description?: string;
    videoUrl?: string;
}

export interface ExerciseResult {
    exerciseId: number;
    rating: number; // 1-5
    timestamp: Date;
}

export interface SessionState {
    currentExerciseIndex: number;
    isActive: boolean;
    startTime?: Date;
    results: ExerciseResult[];
    sessionDuration: number; // in seconds
}
