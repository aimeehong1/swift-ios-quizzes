import React, { useState } from 'react';
import "./../styles/QuizComponent.css";

interface Question {
    question_number: number;
    question_type: 'MCQ' | 'Multiple_answer' | 'Short_answer';
    question_text: string;
    question_options: string[];
    question_answer: string | string[];
}

interface Quiz {
    id: number;
    name: string;
    content: Question[];
}

const QuizComponent: React.FC<{ quiz: Quiz }> = ({ quiz }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string | string[] }>({});
    const [results, setResults] = useState<{ [key: number]: boolean }>({});
    const [score, setScore] = useState<number | null>(null);

    const handleAnswerSelect = (questionNumber: number, answer: string | string[]) => {
        setSelectedAnswers((prev) => ({
            ...prev,
            [questionNumber]: answer,
        }));
    };

    const checkAnswers = () => {
        let correctCount = 0;
        const newResults: { [key: number]: boolean } = {};

        quiz.content.forEach((question) => {
            const userAnswer = selectedAnswers[question.question_number];
            const correctAnswer = question.question_answer;

            if (question.question_type === 'MCQ') {
                newResults[question.question_number] = userAnswer === correctAnswer;
            } else if (question.question_type === 'Multiple_answer') {
                newResults[question.question_number] =
                    Array.isArray(userAnswer) &&
                    userAnswer.length === (correctAnswer as string[]).length &&
                    userAnswer.every((ans) => (correctAnswer as string[]).includes(ans));
            } else if (question.question_type === 'Short_answer') {
                newResults[question.question_number] =
                    typeof userAnswer === 'string' &&
                    (correctAnswer as string[]).some(
                        (correct) => correct.toLowerCase() === userAnswer.toLowerCase()
                    );
            }

            if (newResults[question.question_number]) {
                correctCount++;
            }
        });

        setResults(newResults);
        setScore(correctCount);
    };

    return (
        <div className="quiz-container">
            <h1 className="quiz-title">{quiz.name}</h1>
            {quiz.content.map((question) => (
                <div key={question.question_number} className="question-container">
                    <h3 className="question-text">{question.question_text}</h3>
                    <div className="options-container">
                        {question.question_type === 'MCQ' || question.question_type === 'Multiple_answer' ? (
                            question.question_options.map((option) => (
                                <label key={option} className="option-label">
                                    <input
                                        type={question.question_type === 'MCQ' ? 'radio' : 'checkbox'}
                                        name={`question-${question.question_number}`}
                                        value={option}
                                        onChange={(e) => {
                                            if (question.question_type === 'MCQ') {
                                                handleAnswerSelect(question.question_number, option);
                                            } else if (question.question_type === 'Multiple_answer') {
                                                const currentAnswers = (selectedAnswers[question.question_number] || []) as string[];
                                                const updatedAnswers = e.target.checked
                                                    ? [...currentAnswers, option]
                                                    : currentAnswers.filter((ans) => ans !== option);
                                                handleAnswerSelect(question.question_number, updatedAnswers);
                                            }
                                        }}
                                    />
                                    {option}
                                </label>
                            ))
                        ) : (
                            <input
                                type="text"
                                className="short-answer-input"
                                placeholder="Enter your answer"
                                onChange={(e) => handleAnswerSelect(question.question_number, e.target.value)}
                            />
                        )}
                    </div>
                    {results[question.question_number] !== undefined && (
                        <p className={`result-text ${results[question.question_number] ? 'correct' : 'incorrect'}`}>
                            {results[question.question_number] ? 'Correct!' : 'Incorrect!'}
                        </p>
                    )}
                </div>
            ))}
            <button className="submit-button" onClick={checkAnswers}>Submit Answers</button>

            {score !== null && (
                <div className="score-container">
                    <h2 className="score-text">Your Score: {score} / {quiz.content.length}</h2>
                </div>
            )}
        </div>
    );
};

export default QuizComponent;
