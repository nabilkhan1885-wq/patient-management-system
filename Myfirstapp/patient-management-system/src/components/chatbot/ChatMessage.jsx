import React from 'react';
import { User, Bot } from 'lucide-react';
import { motion } from 'framer-motion';

const ChatMessage = ({ type, content }) => {
  const isUser = type === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, x: isUser ? 20 : -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-start space-x-2 max-w-[80%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className={`rounded-full p-2 ${isUser ? 'bg-blue-600' : 'bg-gray-600'}`}>
          {isUser ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
        </div>
        <div className={`rounded-lg p-3 ${
          isUser 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;