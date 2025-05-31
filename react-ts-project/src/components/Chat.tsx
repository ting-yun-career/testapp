import React from 'react';


const Chat: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#202123] text-white flex flex-col items-center justify-center p-6">
      <h1 className="text-xl font-light mb-8 text-center">Chat</h1>
      <div className="w-full flex justify-center">
        <div className="bg-gray-800 p-4 w-[500px] border border-gray-300 rounded-lg bg-red-500">
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