import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const initialMessages = [
  { text: "How can I help you today?", options: ["I want to update my workout", "Explain my workout", "I need a new workout"], isUser: false }
];

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionClick = async (option: string, messageIndex: number) => {
    setSelectedOption(option);
    const newMessages = messages.map((message, index) => {
      if (index === messageIndex) {
        return { ...message, options: [], selectedOption: option };
      }
      return message;
    });

    if (option === "I want to update my workout") {
      setMessages([...newMessages, { text: option, options: [], isUser: true }, { text: "What needs to be updated?", options: ["I need more of a challenge", "I need less of a challenge"], isUser: false }]);
    } else if (option === "I need less of a challenge") {
      setMessages([...newMessages, { text: option, options: [], isUser: true }, { text: "No problem! Why do you need less of a challenge?", options: ["I'm unable to complete the workouts", "I'm injured", "I'm sick"], isUser: false }]);
    } else if (option === "I'm injured") {
      setMessages([...newMessages, { text: option, options: [], isUser: true }, { text: "What kind of injury?", options: ["Upper Body", "Lower Body"], isUser: false }]);
    } else if (option === "Explain my workout" || option === "I need a new workout" || option === "I need more of a challenge" || option === "I'm unable to complete the workouts" || option === "I'm sick" || option === "Upper Body" || option === "Lower Body") {
      setMessages([...newMessages, { text: option, options: [], isUser: true }]);
      try {
        const response = await fetch('/v1/gpt/generateChat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: option,
            gpt_model: "gemini-1.5-flash",
            gpt_service: "gemini",
            user_id: 19,
            returnJson: false
          })
        });
        const data = await response.json();
        setMessages(prevMessages => [...prevMessages, { text: data.text, options: [], isUser: false }]);
      } catch (error) {
        console.error('Error:', error);
        setMessages(prevMessages => [...prevMessages, { text: 'Failed to get response from server.', options: [], isUser: false }]);
      }
    } else {
      setMessages([...newMessages, { text: option, options: [], isUser: true }, { text: `You selected: ${option}`, options: [], isUser: false }]);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '10px' }}>
      {messages.map((message, index) => (
        <div key={index} style={{ marginBottom: '20px', textAlign: message.isUser ? 'right' : 'left' }}>
          <div style={{
            display: 'inline-block',
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: message.isUser ? 'green' : 'grey',
            maxWidth: '80%',
            textAlign: 'left'
          }}>
            <ReactMarkdown>{message.text}</ReactMarkdown>
            {message.options.length > 0 && (
              <div>
                {message.options.map((option, idx) => (
                  <button key={idx} onClick={() => handleOptionClick(option, index)} style={{ display: 'block', margin: '5px 0' }}>
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}