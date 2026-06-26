import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';
import logo from '../../imports/image.png';

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="h-screen w-screen overflow-hidden bg-white relative flex flex-col items-center justify-center font-sans">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(23, 60, 122, 0.056) 1px, transparent 2px)",
          backgroundSize: "36px 36px"
        }}
      />
      
      {/* Decorative blurred background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#306FB8]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-[#173C7A]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="z-10 flex flex-col items-center max-w-lg text-center px-6"
      >
        <motion.img 
          src={logo} 
          alt="Archer Logo" 
          className="h-20 mb-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        />
        
        <motion.h1 
          className="text-4xl md:text-5xl font-bold text-[#173C7A] mb-4 tracking-tight"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
        </motion.h1>
        
        <motion.p 
          className="text-lg text-gray-500 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Navigate your professional journey with AI-driven insights, career roadmaps, and actionable advice.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="w-full max-w-sm flex flex-col gap-4"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              onLogin();
            }}
            className="flex flex-col gap-3"
          >
            {!isLogin && (
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#306FB8]/20 focus:border-[#306FB8] transition-all"
                required
              />
            )}
            <input 
              type="email" 
              placeholder="Email address" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#306FB8]/20 focus:border-[#306FB8] transition-all"
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#306FB8]/20 focus:border-[#306FB8] transition-all"
              required
            />
            <button
              type="submit"
              className="w-full bg-[#173C7A] hover:bg-[#112a57] text-white font-medium py-3.5 rounded-xl shadow-sm hover:shadow transition-all active:scale-[0.98] mt-1"
            >
              {isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>

          <p className="text-sm text-gray-500 mt-1">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[#306FB8] hover:text-[#173C7A] font-medium transition-colors"
            >
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>

          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-sm text-gray-400 font-medium">OR</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          <button
            type="button"
            onClick={onLogin}
            className="w-full flex items-center justify-center gap-3 bg-white border border-gray-200 shadow-sm hover:shadow-md px-6 py-3.5 rounded-xl text-gray-700 font-medium transition-all active:scale-[0.98] group"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            <span>Continue with Google</span>
          </button>
        </motion.div>
        
      </motion.div>
    </div>
  );
}
