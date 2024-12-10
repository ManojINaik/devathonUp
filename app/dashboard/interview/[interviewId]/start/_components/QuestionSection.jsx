"use client";
import { Lightbulb, Volume2, VolumeX, Pause, Play } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

const RobotAvatar = ({ isSpeaking }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-24 h-24 relative"
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Robot Head */}
        <motion.path
          d="M20 30 H80 V80 Q80 90 70 90 H30 Q20 90 20 80 V30"
          fill="#4B5563"
          stroke="#374151"
          strokeWidth="2"
        />
        
        {/* Antenna */}
        <motion.path
          d="M50 10 L50 25"
          stroke="#374151"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <motion.circle
          cx="50"
          cy="8"
          r="3"
          fill="#60A5FA"
        />
        
        {/* Eyes */}
        <motion.circle
          cx="35"
          cy="45"
          r="8"
          fill="#60A5FA"
          animate={{
            scale: isSpeaking ? [1, 1.1, 1] : 1
          }}
          transition={{
            duration: 0.5,
            repeat: isSpeaking ? Infinity : 0,
            repeatType: "reverse"
          }}
        />
        <motion.circle
          cx="65"
          cy="45"
          r="8"
          fill="#60A5FA"
          animate={{
            scale: isSpeaking ? [1, 1.1, 1] : 1
          }}
          transition={{
            duration: 0.5,
            repeat: isSpeaking ? Infinity : 0,
            repeatType: "reverse",
            delay: 0.25
          }}
        />
        
        {/* Mouth */}
        <motion.rect
          x="35"
          y="65"
          width="30"
          height="4"
          rx="2"
          fill="#60A5FA"
          animate={{
            scaleY: isSpeaking ? [1, 2, 1] : 1,
            y: isSpeaking ? [65, 64, 65] : 65
          }}
          transition={{
            duration: 0.3,
            repeat: isSpeaking ? Infinity : 0,
            repeatType: "reverse"
          }}
        />
        
        {/* Decorative Elements */}
        <motion.circle
          cx="20"
          cy="30"
          r="2"
          fill="#60A5FA"
        />
        <motion.circle
          cx="80"
          cy="30"
          r="2"
          fill="#60A5FA"
        />
      </svg>
      
      {/* Speech Animation Circles */}
      {isSpeaking && (
        <motion.div className="absolute -right-2 top-1/2 flex gap-1">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-blue-400"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

const QuestionSection = ({ mockInterviewQuestion, activeQuestionIndex }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const speechRef = useRef(null);

  const startSpeech = (text) => {
    if ("speechSynthesis" in window && !isMuted) {
      try {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        // Clear any existing speech
        if (speechRef.current) {
          speechRef.current = null;
        }
        
        const speech = new SpeechSynthesisUtterance(text);
        
        // Get available voices
        let voices = window.speechSynthesis.getVoices();
        
        // If voices aren't loaded yet, wait for them
        if (voices.length === 0) {
          return new Promise((resolve) => {
            window.speechSynthesis.onvoiceschanged = () => {
              voices = window.speechSynthesis.getVoices();
              resolve(voices);
            };
          }).then((voices) => {
            setupSpeech(speech, voices, text);
          });
        } else {
          setupSpeech(speech, voices, text);
        }
      } catch (error) {
        console.error('Error in speech synthesis:', error);
        setIsSpeaking(false);
        setIsPaused(false);
      }
    }
  };

  const setupSpeech = (speech, voices, text) => {
    try {
      // Find a suitable voice
      const preferredVoice = voices.find(
        voice => 
          (voice.name.includes('Natural') || 
           voice.name.includes('Premium') ||
           voice.name.includes('Neural') ||
           voice.name.includes('Google UK English Female') ||
           voice.name.includes('Microsoft Libby') ||
           voice.name.includes('Samantha')) &&
          voice.lang.includes('en')
      ) || voices.find(voice => voice.lang.startsWith('en'));

      if (preferredVoice) {
        speech.voice = preferredVoice;
      }

      // Adjust speech parameters for more natural sound
      speech.rate = 0.85; // Slightly slower
      speech.pitch = 1.0; // Natural pitch
      speech.volume = 1.0; // Full volume
      
      // Process text for better speech flow
      const processedText = text
        .replace(/([.!?])\s*/g, '$1 ')
        .replace(/,\s*/g, ', ')
        .replace(/(\w+)-(\w+)/g, '$1 $2');
      
      speech.text = processedText;
      speechRef.current = speech;
      
      // Set up event handlers
      speech.onstart = () => {
        setIsSpeaking(true);
        setIsPaused(false);
      };
      
      speech.onend = () => {
        setIsSpeaking(false);
        setIsPaused(false);
        speechRef.current = null;
      };

      speech.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsSpeaking(false);
        setIsPaused(false);
        speechRef.current = null;
        
        // Handle specific error cases
        if (event.error === 'not-allowed') {
          setHasUserInteracted(false);
        } else if (event.error === 'interrupted' || event.error === 'canceled') {
          // These are normal when stopping speech, don't need special handling
          return;
        } else {
          // For other errors, try to restart after a delay
          setTimeout(() => {
            if (hasUserInteracted && !isMuted) {
              startSpeech(text);
            }
          }, 1000);
        }
      };
      
      window.speechSynthesis.speak(speech);
    } catch (error) {
      console.error('Error in speech setup:', error);
      setIsSpeaking(false);
      setIsPaused(false);
      speechRef.current = null;
    }
  };

  const handleStartInterview = () => {
    setHasUserInteracted(true);
    if (mockInterviewQuestion?.[activeQuestionIndex]?.Question) {
      startSpeech(mockInterviewQuestion[activeQuestionIndex].Question);
    }
  };

  useEffect(() => {
    // Initialize voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

    // Cleanup function
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
        speechRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (hasUserInteracted && mockInterviewQuestion?.[activeQuestionIndex]?.Question) {
      startSpeech(mockInterviewQuestion[activeQuestionIndex].Question);
    }
    
    return () => {
      if (speechRef.current) {
        window.speechSynthesis.cancel();
        speechRef.current = null;
      }
    };
  }, [activeQuestionIndex, mockInterviewQuestion, isMuted, hasUserInteracted]);

  const togglePause = () => {
    if (isSpeaking && speechRef.current) {
      if (isPaused) {
        window.speechSynthesis.resume();
      } else {
        window.speechSynthesis.pause();
      }
      setIsPaused(!isPaused);
    }
  };

  const toggleMute = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      speechRef.current = null;
      setIsSpeaking(false);
    }
    setIsMuted(!isMuted);
  };

  return (
    mockInterviewQuestion && (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col justify-between p-5 border rounded-lg my-1 bg-secondary"
      >
        {!hasUserInteracted ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold mb-4">Ready to Start Your Interview?</h3>
            <p className="text-gray-600 mb-6">Click the button below to begin the interview with AI-powered voice interaction.</p>
            <Button
              onClick={handleStartInterview}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg"
            >
              Start Interview
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              <AnimatePresence>
                {mockInterviewQuestion.map((question, index) => (
                  <motion.h2
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`p-2 rounded-full text-center text-xs md:text-sm cursor-pointer md:block hidden ${
                      activeQuestionIndex == index
                        ? "bg-black text-white"
                        : "bg-secondary"
                    }`}
                  >
                    Question #{index + 1}
                  </motion.h2>
                ))}
              </AnimatePresence>
            </div>

            <div className="flex items-center gap-8 my-8">
              <RobotAvatar isSpeaking={isSpeaking && !isPaused} />
              
              <motion.h2 
                key={activeQuestionIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="flex-1 text-md md:text-lg"
              >
                {mockInterviewQuestion[activeQuestionIndex]?.Question}
              </motion.h2>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  toggleMute();
                  if (!isSpeaking && !isMuted) {
                    startSpeech(mockInterviewQuestion[activeQuestionIndex]?.Question);
                  }
                }}
                className="p-2 rounded-full hover:bg-gray-100"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-red-500" />
                ) : (
                  <Volume2 className="w-6 h-6 text-blue-500" />
                )}
              </motion.button>

              {isSpeaking && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePause}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  {isPaused ? (
                    <Play className="w-6 h-6 text-green-500" />
                  ) : (
                    <Pause className="w-6 h-6 text-blue-500" />
                  )}
                </motion.button>
              )}
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border rounded-lg p-5 bg-blue-100 mt-8 md:block hidden space-y-4"
            >
              <h2 className="flex gap-2 items-center text-blue-800 font-semibold text-lg">
                <Lightbulb className="w-6 h-6" />
                <span>Interview Instructions</span>
              </h2>
              
              <div className="space-y-3 text-sm text-blue-700">
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Listen carefully to the AI-powered interviewer's questions. You can use the controls to pause, resume, or mute the audio.
                </p>
                
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Take your time to think before responding. The system will analyze your answers using advanced AI technology.
                </p>
                
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Speak clearly and maintain a professional tone throughout the interview.
                </p>
                
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Your responses will be evaluated based on content, clarity, and relevance to the question.
                </p>
                
                <p className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  Feel free to request question repetition using the audio controls if needed.
                </p>
              </div>
              
              <div className="mt-4 text-xs text-blue-600 border-t border-blue-200 pt-3">
                <strong>Pro Tip:</strong> Stay relaxed and authentic in your responses. Our AI is designed to have a natural conversation while evaluating your skills.
              </div>
            </motion.div>
          </>
        )}
      </motion.div>
    )
  );
};

export default QuestionSection;
