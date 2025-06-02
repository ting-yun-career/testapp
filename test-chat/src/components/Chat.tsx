import React from 'react'

const Chat: React.FC = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow flex justify-center p-4">
        <div className="bg-gray-800 p-4 w-full border border-gray-300 rounded-md flex flex-col">
          <textarea
            className="flex-grow resize-none bg-transparent text-white placeholder-gray-500 font-sans text-base focus:outline-none"
            placeholder="Ask anything"
          ></textarea>
        </div>
      </div>
    </div>
  )
}

export default Chat
