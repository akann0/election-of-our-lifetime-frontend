import React, { useState } from 'react';
import './ComparisonForm.css';

const ComparisonForm = ({ onCompare, isLoading, small }) => {
  const [choice1, setChoice1] = useState('');
  const [choice2, setChoice2] = useState('');
  const [errors, setErrors] = useState({});

  const validateInputs = () => {
    const newErrors = {};
    if (!choice1.trim()) {
      newErrors.choice1 = 'First choice is required';
    } else if (choice1.trim().length < 2) {
      newErrors.choice1 = 'First choice must be at least 2 characters';
    }
    if (!choice2.trim()) {
      newErrors.choice2 = 'Second choice is required';
    } else if (choice2.trim().length < 2) {
      newErrors.choice2 = 'Second choice must be at least 2 characters';
    }
    if (choice1.trim().toLowerCase() === choice2.trim().toLowerCase()) {
      newErrors.choice2 = 'Choices must be different';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateInputs()) {
      onCompare(choice1.trim(), choice2.trim());
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <div className={`comparison-form-container${small ? ' small' : ''}`}>
      <h2>Ballot</h2>
      <form onSubmit={handleSubmit} className="comparison-form">
        <div className="input-group">
          <label htmlFor="choice1">First Choice:</label>
          <input
            type="text"
            id="choice1"
            value={choice1}
            onChange={(e) => setChoice1(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., pizza, iPhone, Taylor Swift"
            className={errors.choice1 ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.choice1 && <span className="error-message">{errors.choice1}</span>}
        </div>
        
        <div className="vs-divider">VS</div>
        
        <div className="input-group">
          <label htmlFor="choice2">Second Choice:</label>
          <input
            type="text"
            id="choice2"
            value={choice2}
            onChange={(e) => setChoice2(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., burger, Android, Beyoncé"
            className={errors.choice2 ? 'error' : ''}
            disabled={isLoading}
          />
          {errors.choice2 && <span className="error-message">{errors.choice2}</span>}
        </div>
        
        <button 
          type="submit" 
          className="compare-button"
          disabled={isLoading || !choice1.trim() || !choice2.trim()}
        >
          {isLoading ? 'Counting Votes...' : 'Submit Ballot'}
        </button>
      </form>
    </div>
  );
};

export default ComparisonForm; 