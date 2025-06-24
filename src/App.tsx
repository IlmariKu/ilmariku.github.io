import { useState, useEffect } from 'react';
import './App.css';
import { SessionState } from './types';
import { exercises, EXERCISE_DURATION } from './exerciseData';

type AppScreen = 'welcome' | 'exercise' | 'rest' | 'complete';

function App() {
  const [screen, setScreen] = useState<AppScreen>('welcome');
  const [selectedDuration, setSelectedDuration] = useState(EXERCISE_DURATION);
  const [selectedRestDuration, setSelectedRestDuration] = useState(10);
  const [session, setSession] = useState<SessionState>({
    currentExerciseIndex: 0,
    isActive: false,
    results: [],
    sessionDuration: EXERCISE_DURATION
  });
  const [timeLeft, setTimeLeft] = useState(EXERCISE_DURATION);

  // Sound function
  const playRestSound = () => {
    // Create a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime); // Higher pitch beep
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported in this browser');
    }
  };

  // Sound function for exercise start
  const playExerciseStartSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Two quick beeps for exercise start
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);

      // Second beep
      setTimeout(() => {
        try {
          const audioContext2 = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator2 = audioContext2.createOscillator();
          const gainNode2 = audioContext2.createGain();

          oscillator2.connect(gainNode2);
          gainNode2.connect(audioContext2.destination);

          oscillator2.frequency.setValueAtTime(800, audioContext2.currentTime);
          gainNode2.gain.setValueAtTime(0.3, audioContext2.currentTime);
          gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext2.currentTime + 0.2);

          oscillator2.start(audioContext2.currentTime);
          oscillator2.stop(audioContext2.currentTime + 0.2);
        } catch (error) {
          console.log('Audio not supported in this browser');
        }
      }, 250);
    } catch (error) {
      console.log('Audio not supported in this browser');
    }
  };

  // Sound function for countdown
  const playCountdownSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(400, audioContext.currentTime); // Lower pitch for countdown
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('Audio not supported in this browser');
    }
  };

  // Timer logic
  useEffect(() => {
    let interval: number;

    if (session.isActive && timeLeft > 0 && (screen === 'exercise' || screen === 'rest')) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          // Play countdown sound in the last 3 seconds of rest (but not at 0)
          if (screen === 'rest' && newTime <= 3 && newTime > 0) {
            playCountdownSound();
          }
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && screen === 'exercise') {
      // Exercise time's up, move to next exercise or complete session
      if (session.currentExerciseIndex < exercises.length - 1) {
        setSession(prev => ({
          ...prev,
          currentExerciseIndex: prev.currentExerciseIndex + 1
        }));
        // Start rest period if rest duration > 0, otherwise go straight to next exercise
        if (selectedRestDuration > 0) {
          playRestSound(); // Play sound when rest begins
          setTimeLeft(selectedRestDuration);
          setScreen('rest');
        } else {
          setTimeLeft(selectedDuration);
          setScreen('exercise');
        }
      } else {
        setSession(prev => ({ ...prev, isActive: false }));
        setScreen('complete');
      }
    } else if (timeLeft === 0 && screen === 'rest') {
      // Rest time's up, move to next exercise
      playExerciseStartSound(); // Play sound when exercise starts after rest
      setTimeLeft(selectedDuration);
      setScreen('exercise');
    }

    return () => clearInterval(interval);
  }, [session.isActive, timeLeft, screen, selectedDuration]);

  const startSession = () => {
    setSession(prev => ({
      ...prev,
      isActive: true,
      startTime: new Date(),
      currentExerciseIndex: 0,
      results: [],
      sessionDuration: selectedDuration
    }));
    setTimeLeft(selectedDuration);
    setScreen('exercise');
    // Play sound when first exercise starts
    setTimeout(() => playExerciseStartSound(), 100);
  };

  const resetSession = () => {
    setSession({
      currentExerciseIndex: 0,
      isActive: false,
      results: [],
      sessionDuration: selectedDuration
    });
    setTimeLeft(selectedDuration);
    setScreen('welcome');
  };

  const skipToNext = () => {
    // Move to next exercise or complete session
    if (session.currentExerciseIndex < exercises.length - 1) {
      setSession(prev => ({
        ...prev,
        currentExerciseIndex: prev.currentExerciseIndex + 1
      }));
      // Start rest period if rest duration > 0, otherwise go straight to next exercise
      if (selectedRestDuration > 0) {
        playRestSound(); // Play sound when rest begins
        setTimeLeft(selectedRestDuration);
        setScreen('rest');
      } else {
        setTimeLeft(selectedDuration);
        setScreen('exercise');
      }
    } else {
      setSession(prev => ({ ...prev, isActive: false }));
      setScreen('complete');
    }
  };

  const renderWelcomeScreen = () => (
    <div className="screen welcome-screen">
      <h1>10K Touches Soccer Training</h1>
      <p>You'll go through {exercises.length} exercises.</p>

      <div className="duration-selector">
        <h3>Exercise Duration</h3>
        <div className="duration-options">
          {[10, 15, 20, 30, 45, 60].map(duration => (
            <button
              key={duration}
              className={`duration-btn ${selectedDuration === duration ? 'active' : ''}`}
              onClick={() => setSelectedDuration(duration)}
            >
              {duration}s
            </button>
          ))}
        </div>
        <div className="custom-duration">
          <label htmlFor="custom-time">Custom time (seconds):</label>
          <input
            id="custom-time"
            type="number"
            min="5"
            max="300"
            value={selectedDuration}
            onChange={(e) => setSelectedDuration(Number(e.target.value))}
            className="custom-time-input"
          />
        </div>
      </div>

      <div className="duration-selector">
        <h3>Rest Duration Between Exercises</h3>
        <div className="duration-options">
          {[0, 5, 10, 15, 20, 30].map(duration => (
            <button
              key={duration}
              className={`duration-btn ${selectedRestDuration === duration ? 'active' : ''}`}
              onClick={() => setSelectedRestDuration(duration)}
            >
              {duration === 0 ? 'None' : `${duration}s`}
            </button>
          ))}
        </div>
        <div className="custom-duration">
          <label htmlFor="custom-rest-time">Custom rest (seconds):</label>
          <input
            id="custom-rest-time"
            type="number"
            min="0"
            max="120"
            value={selectedRestDuration}
            onChange={(e) => setSelectedRestDuration(Number(e.target.value))}
            className="custom-time-input"
          />
        </div>
      </div>

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
            onClick={skipToNext}
          >
            Skip to Next
          </button>
        </div>
      </div>
    );
  };

  const renderCompleteScreen = () => {
    return (
      <div className="screen complete-screen">
        <h1>🎉 Session Complete!</h1>
        <div className="stats">
          <p>Exercises completed: {exercises.length}</p>
        </div>

        <button className="restart-btn" onClick={resetSession}>
          Start New Session
        </button>
      </div>
    );
  };

  const renderRestScreen = () => {
    const nextExercise = exercises[session.currentExerciseIndex];

    return (
      <div className="screen rest-screen">
        <div className="rest-header">
          <div className="progress">
            Next: Exercise {session.currentExerciseIndex + 1} of {exercises.length}
          </div>
          <div className="timer rest-timer">
            {timeLeft}s
          </div>
        </div>

        <div className="rest-content">
          <h2>Rest Time 🔔</h2>
          <p className="next-exercise">Next up: {nextExercise.title}</p>
          {nextExercise.description && (
            <p className="exercise-description">{nextExercise.description}</p>
          )}
          {timeLeft <= 3 && timeLeft > 0 && (
            <p className="countdown-warning">🔔 Get ready! Starting in {timeLeft}...</p>
          )}
        </div>

        <div className="rest-actions">
          <button
            className="skip-btn"
            onClick={() => {
              setTimeLeft(selectedDuration);
              setScreen('exercise');
            }}
          >
            Skip Rest
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      {screen === 'welcome' && renderWelcomeScreen()}
      {screen === 'exercise' && renderExerciseScreen()}
      {screen === 'rest' && renderRestScreen()}
      {screen === 'complete' && renderCompleteScreen()}
    </div>
  );
}

export default App;
