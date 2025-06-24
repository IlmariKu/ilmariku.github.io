import { useState, useEffect } from 'react';
import './App.css';
import { SessionState, ExerciseResult } from './types';
import { exercises, EXERCISE_DURATION } from './exerciseData';

type AppScreen = 'welcome' | 'exercise' | 'rating' | 'complete';

function App() {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [session, setSession] = useState<SessionState>({
    currentExerciseIndex: 0,
    isActive: false,
    results: [],
    sessionDuration: EXERCISE_DURATION
  });
  const [timeLeft, setTimeLeft] = useState(EXERCISE_DURATION);

  // Timer logic
  useEffect(() => {
    let interval: number;

    if (session.isActive && timeLeft > 0 && screen === 'exercise') {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && screen === 'exercise') {
      // Time's up, move to rating screen
      setScreen('rating');
    }

    return () => clearInterval(interval);
  }, [session.isActive, timeLeft, screen]);

  const startSession = () => {
    setSession(prev => ({
      ...prev,
      isActive: true,
      startTime: new Date(),
      currentExerciseIndex: 0,
      results: []
    }));
    setTimeLeft(EXERCISE_DURATION);
    setScreen('exercise');
  };

  const rateExercise = (rating: number) => {
    const currentExercise = exercises[session.currentExerciseIndex];
    const result: ExerciseResult = {
      exerciseId: currentExercise.id,
      rating,
      timestamp: new Date()
    };

    setSession(prev => ({
      ...prev,
      results: [...prev.results, result]
    }));

    // Move to next exercise or complete session
    if (session.currentExerciseIndex < exercises.length - 1) {
      setSession(prev => ({
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex + 1
      }));
      setTimeLeft(EXERCISE_DURATION);
      setScreen('exercise');
    } else {
      setSession(prev => ({ ...prev, isActive: false }));
      setScreen('complete');
    }
  };

  const resetSession = () => {
    setSession({
      currentExerciseIndex: 0,
      isActive: false,
      results: [],
      sessionDuration: EXERCISE_DURATION
    });
    setTimeLeft(EXERCISE_DURATION);
    setScreen('welcome');
  };

  const renderWelcomeScreen = () => (
    <div className="screen welcome-screen">
      <h1>10K Touches Soccer Training</h1>
      <p>Ready to start your training session?</p>
      <p>You'll go through {exercises.length} exercises, {EXERCISE_DURATION} seconds each.</p>
      <button className="start-btn" onClick={startSession}>
        Start Training
      </button>
    </div>
  );

  const renderExerciseScreen = () => {
    const currentExercise = exercises[session.currentExerciseIndex];

    return (
      <div className="screen exercise-screen">
        <div className="exercise-header">
          <div className="progress">
            Exercise {session.currentExerciseIndex + 1} of {exercises.length}
          </div>
          <div className="timer">
            {timeLeft}s
          </div>
        </div>

        <div className="exercise-content">
          <h2>{currentExercise.title}</h2>
          {currentExercise.description && (
            <p className="exercise-description">{currentExercise.description}</p>
          )}
          {currentExercise.videoUrl && (
            <div className="video-link">
              <a href={currentExercise.videoUrl} target="_blank" rel="noopener noreferrer">
                📹 Watch Video
              </a>
            </div>
          )}
        </div>

        <div className="exercise-actions">
          <button
            className="skip-btn"
            onClick={() => setScreen('rating')}
          >
            Finish Early
          </button>
        </div>
      </div>
    );
  };

  const renderRatingScreen = () => {
    const currentExercise = exercises[session.currentExerciseIndex];

    return (
      <div className="screen rating-screen">
        <h2>How did that go?</h2>
        <p className="exercise-name">{currentExercise.title}</p>

        <div className="rating-buttons">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              className={`rating-btn rating-${rating}`}
              onClick={() => rateExercise(rating)}
            >
              {rating === 1 && '😤 Terrible'}
              {rating === 2 && '😔 Poor'}
              {rating === 3 && '😐 Okay'}
              {rating === 4 && '😊 Good'}
              {rating === 5 && '🔥 Excellent'}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderCompleteScreen = () => {
    const averageRating = session.results.length > 0
      ? session.results.reduce((sum, result) => sum + result.rating, 0) / session.results.length
      : 0;

    return (
      <div className="screen complete-screen">
        <h1>🎉 Session Complete!</h1>
        <div className="stats">
          <p>Exercises completed: {session.results.length}</p>
          <p>Average rating: {averageRating.toFixed(1)}/5</p>
        </div>

        <div className="results-summary">
          <h3>Your Results:</h3>
          <div className="results-grid">
            {session.results.map((result, index) => {
              const exercise = exercises.find(ex => ex.id === result.exerciseId);
              return (
                <div key={result.exerciseId} className="result-item">
                  <span className="exercise-number">{index + 1}.</span>
                  <span className="exercise-title">{exercise?.title}</span>
                  <span className="rating">{'⭐'.repeat(result.rating)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button className="restart-btn" onClick={resetSession}>
          Start New Session
        </button>
      </div>
    );
  };

  return (
    <div className="app">
      {screen === 'welcome' && renderWelcomeScreen()}
      {screen === 'exercise' && renderExerciseScreen()}
      {screen === 'rating' && renderRatingScreen()}
      {screen === 'complete' && renderCompleteScreen()}
    </div>
  );
}

export default App;
