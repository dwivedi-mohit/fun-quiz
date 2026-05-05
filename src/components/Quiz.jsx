import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, 
  RefreshCcw, 
  CheckCircle2, 
  XCircle, 
  ChevronRight,
  Loader2,
  Code,
  Cloud,
  Github,
  GitMerge
} from "lucide-react";

const CATEGORY_ICONS = {
  "Gen AI": <Code className="w-5 h-5" />,
  "AWS": <Cloud className="w-5 h-5" />,
  "GitHub": <Github className="w-5 h-5" />,
  "GitLab": <GitMerge className="w-5 h-5" />
};

import { quizQuestions } from "../data/questions";

export default function Quiz() {
  const [questions, setQuestions] = useState(quizQuestions);
  const [loading, setLoading] = useState(false); // No longer loading from fetch
  const ROASTS = [
    "Bro is literally cooked 💀",
    "Negative Aura unlocked 😭",
    "My grandma codes better than you 💅",
    "Did you even read the docs? 🤡",
    "Massive Skill Issue 📉",
    "Take the L and pack it up bro 🛑",
    "Bro really thought that was the answer 💀"
  ];

  const [state, setState] = useState({
    currentQuestionIndex: 0,
    score: 0,
    aura: 0,
    roast: "",
    streak: 0,
    answers: {},
    isComplete: false,
    selectedCategory: null,
    isDeepFried: false
  });

  const getAuraRank = (aura) => {
    if (aura <= -10000) return "Cooked NPC 💀";
    if (aura < 0) return "Average Ohio Resident 🚜";
    if (aura < 5000) return "Beta Coder 🤓";
    if (aura < 10000) return "Sigma Developer 🗿";
    return "Giga Chad 10X Engineer 🌌";
  };

  // Removed fetch useEffect since data is loaded synchronously

  const filteredQuestions = state.selectedCategory && state.selectedCategory !== "All"
    ? questions.filter(q => q.category === state.selectedCategory)
    : questions;

  const currentQuestion = filteredQuestions[state.currentQuestionIndex];

  const handleSelectCategory = (category) => {
    setState({
      currentQuestionIndex: 0,
      score: 0,
      aura: 0,
      roast: "",
      streak: 0,
      answers: {},
      isComplete: false,
      selectedCategory: category,
      isDeepFried: false
    });
  };

  const handleAnswer = (optionIndex) => {
    if (state.answers[currentQuestion.id] !== undefined) return;

    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    const newStreak = isCorrect ? state.streak + 1 : 0;
    
    const randomRoast = ROASTS[Math.floor(Math.random() * ROASTS.length)];

    // Sound Effects Logic
    try {
      if (isCorrect) {
        if (newStreak > 0 && newStreak % 3 === 0) {
          new Audio('/sounds/streak.mp3').play().catch(e => console.log('Audio disabled by browser', e));
        } else {
          new Audio('/sounds/correct.mp3').play().catch(e => console.log('Audio disabled by browser', e));
        }
      } else {
        new Audio('/sounds/ghop_ghop.mp3').play().catch(e => console.log('Audio disabled by browser', e));
        
        // Robot Voice speaks the roast out loud!
        const utterance = new SpeechSynthesisUtterance(randomRoast);
        utterance.pitch = 0.5; // low pitch
        utterance.rate = 1.2; // fast
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      console.log('Audio error:', err);
    }

    setState(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      aura: isCorrect ? prev.aura + 1000 : prev.aura - 5000,
      roast: !isCorrect ? randomRoast : "",
      streak: newStreak,
      isDeepFried: !isCorrect,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: optionIndex
      }
    }));

    // Remove deep fried effect after 1.5s
    if (!isCorrect) {
      setTimeout(() => {
        setState(prev => ({ ...prev, isDeepFried: false }));
      }, 1500);
    }
  };

  const handleNext = () => {
    if (state.currentQuestionIndex < filteredQuestions.length - 1) {
      setState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    } else {
      setState(prev => ({ ...prev, isComplete: true }));
    }
  };

  const resetQuiz = () => {
    setState({
      currentQuestionIndex: 0,
      score: 0,
      aura: 0,
      roast: "",
      streak: 0,
      answers: {},
      isComplete: false,
      selectedCategory: state.selectedCategory,
      isDeepFried: false
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!state.selectedCategory) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-12">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 mb-6 drop-shadow-lg">
            Quiz by Mohit
          </h1>
          <p className="text-gray-400 text-lg md:text-xl font-light tracking-wide">Select a category to begin your challenge.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {["Gen AI", "AWS", "GitHub", "GitLab"].map((cat, i) => (
            <motion.button
              key={cat}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelectCategory(cat)}
              className="glass-panel p-8 rounded-3xl transition-all group hover:border-purple-500/50 hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="p-4 rounded-2xl bg-white/5 text-white group-hover:text-purple-400 group-hover:bg-purple-500/20 transition-all shadow-inner">
                    {CATEGORY_ICONS[cat]}
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-bold text-white mb-1">{cat}</h3>
                    <p className="text-sm text-gray-400 group-hover:text-gray-300">{questions.filter(q => q.category === cat).length} Questions available</p>
                  </div>
                </div>
                <ChevronRight className="w-8 h-8 text-gray-500 group-hover:text-white transition-colors group-hover:translate-x-2" />
              </div>
            </motion.button>
          ))}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelectCategory("All")}
            className="glass-panel p-8 rounded-3xl transition-all md:col-span-2 group hover:border-pink-500/50 hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="p-4 rounded-2xl bg-white/5 text-white group-hover:text-pink-400 group-hover:bg-pink-500/20 transition-all shadow-inner">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="text-left">
                  <h3 className="text-2xl font-bold text-white mb-1">Ultimate Mixed Challenge</h3>
                  <p className="text-sm text-gray-400 group-hover:text-gray-300">All {questions.length} questions</p>
                </div>
              </div>
              <ChevronRight className="w-8 h-8 text-gray-500 group-hover:text-white transition-colors group-hover:translate-x-2" />
            </div>
          </motion.button>
        </div>
      </div>
    );
  }

  if (state.isComplete) {
    const percentage = Math.round((state.score / filteredQuestions.length) * 100);
    return (
      <div className="max-w-2xl mx-auto p-6 mt-20 text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="glass-panel p-12 rounded-3xl"
        >
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
          >
            <Trophy className="w-24 h-24 mx-auto text-yellow-400 mb-8 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
          </motion.div>
          <h2 className="text-5xl font-extrabold text-white mb-4">Bro's Final Aura 💀</h2>
          <div className="mb-6 inline-block bg-white/10 px-6 py-2 rounded-full border border-white/20">
            <span className="text-lg text-gray-400">Final Rank: </span>
            <span className="text-2xl font-bold text-yellow-400 tracking-wide">{getAuraRank(state.aura)}</span>
          </div>
          <p className="text-2xl text-gray-300 mb-2">You scored <span className="text-purple-400 font-bold">{state.score}</span> out of {filteredQuestions.length} ({percentage}%)</p>
          <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 mb-10">✨ {state.aura} Aura Points</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={resetQuiz}
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium flex items-center justify-center gap-2 transition-all border border-white/5"
            >
              <RefreshCcw className="w-5 h-5" /> Try Again
            </button>
            <button 
              onClick={() => setState(prev => ({ ...prev, selectedCategory: null }))}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold transition-all shadow-lg shadow-purple-500/25"
            >
              Change Category
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!currentQuestion) return <div className="text-center text-white mt-20">No questions available. Generate some first!</div>;

  const hasAnswered = state.answers[currentQuestion.id] !== undefined;
  const selectedAnswer = state.answers[currentQuestion.id];

  return (
    <div className={`max-w-4xl mx-auto p-6 mt-8 transition-all duration-200 ${state.isDeepFried ? 'contrast-200 saturate-[3] sepia-[.5] hue-rotate-15 blur-[1px] scale-105' : ''}`}>
      <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
        <button 
          onClick={() => setState(prev => ({ ...prev, selectedCategory: null }))}
          className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10"
        >
          ← Categories
        </button>
        <div className="flex flex-wrap justify-center gap-3">
          <div className="text-sm font-bold text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-4 py-2 rounded-full shadow-inner flex items-center gap-2">
            Rank: {getAuraRank(state.aura)}
          </div>
          <div className="text-sm font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-full shadow-inner">
            Q {state.currentQuestionIndex + 1} / {filteredQuestions.length}
          </div>
          <div className="text-sm font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-4 py-2 rounded-full shadow-inner flex items-center gap-1">
            ✨ Aura: {state.aura}
          </div>
          <AnimatePresence>
            {state.streak >= 2 && (
              <motion.div 
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0 }}
                className="text-sm font-bold text-orange-400 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full shadow-inner flex items-center gap-1"
              >
                🔥 {state.streak} Streak!
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestion.id}
          initial={{ x: 30, opacity: 0 }}
          animate={hasAnswered && state.roast ? { x: [-10, 10, -10, 10, 0], opacity: 1 } : { x: 0, opacity: 1 }}
          exit={{ x: -30, opacity: 0 }}
          transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
          className="glass-panel rounded-[2rem] p-8 md:p-12"
        >
          <div className="flex flex-wrap items-center gap-3 mb-8 bg-white/5 inline-flex px-4 py-2 rounded-full border border-white/10 text-gray-300">
            {CATEGORY_ICONS[currentQuestion.category]}
            <span className="font-semibold tracking-wide uppercase text-sm">{currentQuestion.category}</span>
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-10 leading-relaxed">
            {currentQuestion.question}
          </h2>

          <div className="space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = currentQuestion.correctAnswer === idx;
              
              let optionClasses = "border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 hover:border-purple-500/50";
              
              if (hasAnswered) {
                if (isCorrect) optionClasses = "border-green-500/50 bg-green-500/10 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.15)]";
                else if (isSelected) optionClasses = "border-red-500/50 bg-red-500/10 text-red-400";
                else optionClasses = "border-white/5 bg-transparent opacity-40 text-gray-500";
              } else if (isSelected) {
                optionClasses = "border-purple-500 bg-purple-500/20 text-white";
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(idx)}
                  disabled={hasAnswered}
                  className={`w-full text-left p-5 md:p-6 rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group ${optionClasses}`}
                >
                  <span className="text-lg md:text-xl font-medium">{option}</span>
                  {hasAnswered && isCorrect && <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 ml-4" />}
                  {hasAnswered && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500 flex-shrink-0 ml-4" />}
                </button>
              );
            })}
          </div>

          <AnimatePresence>
            {hasAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -20 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                className="overflow-hidden mt-8"
              >
                <div className="p-6 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-100 mb-8 backdrop-blur-md">
                  {state.roast && (
                    <motion.p 
                      initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                      className="text-2xl font-black text-red-400 mb-4 uppercase drop-shadow-md"
                    >
                      {state.roast} (-5000 AURA 📉)
                    </motion.p>
                  )}
                  {!state.roast && (
                    <motion.p 
                      initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                      className="text-2xl font-black text-green-400 mb-4 uppercase drop-shadow-md"
                    >
                      W Mans (+1000 AURA ✨)
                    </motion.p>
                  )}
                  <p className="font-bold text-blue-400 mb-2 uppercase tracking-wide text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Why is this actually correct? fr fr.
                  </p>
                  <p className="text-lg leading-relaxed">{currentQuestion.explanation}</p>
                </div>
                <button
                  onClick={handleNext}
                  className="w-full py-5 rounded-2xl bg-white text-black hover:bg-gray-200 font-extrabold text-xl transition-all shadow-xl shadow-white/10 flex items-center justify-center gap-2"
                >
                  {state.currentQuestionIndex < filteredQuestions.length - 1 ? "Next Question 💅" : "View Final Results 💀"}
                  <ChevronRight className="w-6 h-6" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
