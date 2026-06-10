import React from 'react';
import { Send } from 'lucide-react';

const ChatInput = ({ value, onChange, onSend, onKeyPress, disabled }) => {
  return (
    <div className="p-4 border-t">
      <div className="flex space-x-2">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder="Type your message..."
          disabled={disabled}
          rows="1"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
          style={{ minHeight: '40px', maxHeight: '100px' }}
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          className="bg-purple-600 text-white rounded-lg px-4 hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;