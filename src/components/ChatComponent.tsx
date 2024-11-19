import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import BouncingDotsLoader from './BouncingDotsLoader';

const initialMessages = [
  {
    text: 'How can I help you today?',
    options: ['I want to update my workout', 'Explain my workout'],
    isUser: false,
  },
];

const mockUser = {
  id: 19,
  isPaidUser: true,
};

if (mockUser.isPaidUser) {
  initialMessages[0].options.push('Create a new workout');
}

export default function Chat() {
  const [messages, setMessages] = useState(initialMessages);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const addMessage = (
    newMessages: any[],
    text: string,
    options: string[] = [],
    isUser: boolean = false
  ) => {
    setMessages([...newMessages, { text, options, isUser }]);
  };

  const fetchResponse = async (
    requestMessage: string,
    successMessage: string,
    startNewChat: boolean = false
  ) => {
    setLoading(true);
    try {
      const response = await fetch('/v1/gpt/generateChat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: requestMessage,
          gpt_model: 'gemini-1.5-flash',
          gpt_service: 'gemini',
          user_id: mockUser.id,
          returnJson: true,
          isPaidUser: mockUser.isPaidUser,
          startNewChat,
        }),
      });
      const data = await response.json();
      console.log(data);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: successMessage, options: [], isUser: false },
        {
          text: 'Is there anything else I can help you with?',
          options: mockUser.isPaidUser
            ? ['I want to update my workout', 'Explain my workout', 'Create a new workout']
            : ['I want to update my workout', 'Explain my workout'],
          isUser: false,
        },
      ]);
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: 'Failed to get response from server.',
          options: [],
          isUser: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = async (option: string, messageIndex: number) => {
    setSelectedOption(option);
    const newMessages = messages.map((message, index) => {
      if (index === messageIndex) {
        return { ...message, options: [], selectedOption: option };
      }
      return message;
    });

    addMessage(newMessages, option, [], true);

    let requestMessage = '';
    let successMessage = '';

    switch (option) {
      case 'I want to update my workout':
        addMessage(
          [...newMessages, { text: option, options: [], isUser: true }],
          'What needs to be updated?',
          ['I need more of a challenge', 'I need less of a challenge']
        );
        break;
      case 'I need less of a challenge':
        addMessage(
          [...newMessages, { text: option, options: [], isUser: true }],
          'No problem! Why do you need less of a challenge?',
          ["I'm unable to complete the workouts", "I'm injured"]
        );
        break;
      case "I'm injured":
        addMessage(
          [...newMessages, { text: option, options: [], isUser: true }],
          'What kind of injury?',
          ['Upper Body', 'Lower Body']
        );
        break;
      case 'Upper Body':
      case 'Lower Body':
        requestMessage = `update the workout plan to accommodate a ${option.toLowerCase()} injury. Be sure to include recommended numerical minimum reps and numerical recommended maximum reps and numerical sets. The reps min and max should have its own key and values need to be integers. Do not include rest days. Only return a valid JSON object with no decorators or warnings. Set it into a valid JSON object that fits this format: {"workout_plan": {"name of today's workout plan": { "exercises": [{"name": "exercise name","sets": amount of recommended sets,"reps_min": minimum reps,"reps_max": max reps, isWeightsRequired: boolean, description: string },{"name": "exercise name","sets": amount of recommended sets,"reps_min": minimum reps,"reps_max": max reps }]}}, "day2": {}, "day3": {}, "day4": {}}. Once it is completed, verify again that it is valid JSON.`;
        successMessage = 'Your workout has been updated';
        await fetchResponse(requestMessage, successMessage);
        break;
      case 'I need more of a challenge':
        requestMessage = `update the workout plan to be more challenging. Be sure to include recommended numerical minimum reps and numerical recommended maximum reps and numerical sets. The reps min and max should have its own key and values need to be integers. Do not include rest days. Only return a valid JSON object with no decorators or warnings. Set it into a valid JSON object that fits this format: {"workout_plan": {"name of today's workout plan": { "exercises": [{"name": "exercise name","sets": amount of recommended sets,"reps_min": minimum reps,"reps_max": max reps, isWeightsRequired: boolean, description: string },{"name": "exercise name","sets": amount of recommended sets,"reps_min": minimum reps,"reps_max": max reps }]}}, "day2": {}, "day3": {}, "day4": {}}. Once it is completed, verify again that it is valid JSON.`;
        successMessage = 'Your workout has been updated to be more challenging.';
        await fetchResponse(requestMessage, successMessage);
        break;
      case "I'm unable to complete the workouts":
        requestMessage = `update the workout plan to be less challenging. Be sure to include recommended numerical minimum reps and numerical recommended maximum reps and numerical sets. The reps min and max should have its own key and values need to be integers. Do not include rest days. Only return a valid JSON object with no decorators or warnings. Set it into a valid JSON object that fits this format: {"workout_plan": {"name of today's workout plan": { "exercises": [{"name": "exercise name","sets": amount of recommended sets,"reps_min": minimum reps,"reps_max": max reps, isWeightsRequired: boolean, description: string },{"name": "exercise name","sets": amount of recommended sets,"reps_min": minimum reps,"reps_max": max reps }]}}, "day2": {}, "day3": {}, "day4": {}}. Once it is completed, verify again that it is valid JSON.`;
        successMessage = 'Your workout has been updated to be less challenging.';
        await fetchResponse(requestMessage, successMessage);
        break;
      case 'Explain my workout':
        setLoading(true);
        try {
          const response = await fetch('/v1/gpt/generateChat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: option,
              gpt_model: 'gemini-1.5-flash',
              gpt_service: 'gemini',
              user_id: mockUser.id,
              returnJson: false,
              isPaidUser: mockUser.isPaidUser,
              startNewChat: false,
            }),
          });
          const data = await response.json();
          console.log(data);
          setMessages((prevMessages) => [
            ...prevMessages,
            { text: data.text, options: [], isUser: false },
            {
              text: 'Is there anything else I can help you with?',
              options: mockUser.isPaidUser
                ? ['I want to update my workout', 'Explain my workout', 'Create a new workout']
                : ['I want to update my workout', 'Explain my workout'],
              isUser: false,
            },
          ]);
        } catch (error) {
          console.error('Error:', error);
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              text: 'Failed to get response from server.',
              options: [],
              isUser: false,
            },
          ]);
        } finally {
          setLoading(false);
        }
        break;
      case 'Create a new workout':
        requestMessage = `Create a different workout plan. Be sure to include recommended numerical minimum reps and numerical recommended maximum reps and numerical sets. The reps min and max should have its own key and values need to be integers. Do not include rest days. Only return a valid JSON object with no decorators or warnings. Set it into a valid JSON object that fits this format: {"workout_plan": {"name of today's workout plan": { "exercises": [{"name": "exercise name","sets": amount of recommended sets,"reps_min": minimum reps,"reps_max": max reps, isWeightsRequired: boolean, description: string },{"name": "exercise name","sets": amount of recommended sets,"reps_min": minimum reps,"reps_max": max reps }]}}, "day2": {}, "day3": {}, "day4": {}}. Once it is completed, verify again that it is valid JSON.`;
        successMessage = 'New workout created';
        await fetchResponse(requestMessage, successMessage, true);
        break;
      default:
        addMessage(newMessages, `You selected: ${option}`, [], true);
        break;
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div
      style={{
        padding: '20px',
        width: '600px',
        minWidth: '80%',
        margin: '0 auto',
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '10px',
        maxHeight: '80vh',
        overflowY: 'auto',
      }}
    >
      {messages.map((message, index) => (
        <div
          key={index}
          style={{
            marginBottom: '20px',
            textAlign: message.isUser ? 'right' : 'left',
          }}
        >
          <div
            style={{
              display: 'inline-block',
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: message.isUser ? 'green' : 'gray',
              maxWidth: '80%',
              textAlign: 'left',
            }}
          >
            <ReactMarkdown>{message.text}</ReactMarkdown>
          </div>
          {message.options.length > 0 && (
            <div
              style={{
                display: 'flex',
                marginLeft: '100px',
                marginTop: '10px',
                justifyContent: 'right',
              }}
            >
              {message.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionClick(option, index)}
                  style={{
                    display: 'block',
                    margin: '5px',
                    backgroundColor: 'purple',
                  }}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      {loading && <BouncingDotsLoader />}
      <div ref={chatEndRef} />
    </div>
  );
}