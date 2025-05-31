import React from 'react';

const Chat: React.FC = () => {
  return (
    <div className="w-full bg-[#202123] text-white flex flex-col items-center p-4">
      <div className="w-full flex justify-center">
        <div className="bg-gray-800 p-4 w-full border border-gray-300 rounded-md">
          <textarea
            rows={10}
            placeholder="Ask anything"
            className="w-full bg-transparent resize-none text-white placeholder-gray-500 font-sans text-base focus:outline-none"
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default Chat; 