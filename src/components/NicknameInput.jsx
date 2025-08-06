import React from 'react';

const NicknameInput = ({ nickname, setNickname }) => {
  return (
    <input
      type="text"
      value={nickname}
      onChange={(e) => setNickname(e.target.value)}
      className="bg-gray-700 text-white text-center text-lg rounded-full px-6 py-3 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
      placeholder="Enter your nickname"
    />
  );
};

export default NicknameInput;
