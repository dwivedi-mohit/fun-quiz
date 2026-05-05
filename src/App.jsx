import React from 'react';
import Quiz from './components/Quiz';

function App() {
  return (
    <div className="min-h-screen bg-black relative">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-600/20 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-blue-600/10 rounded-full blur-[100px]" />
      </div>
      
      <div className="relative z-10 container mx-auto">
        <Quiz />
      </div>
    </div>
  );
}

export default App;
