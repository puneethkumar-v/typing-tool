import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const TypingOverlayComponent = () => {
  const [textToType, setTextToType] =
    useState("Handles word wrapping with wordBreak: break-word, keeping the caret properly aligned across lines.");
  const [userInput, setUserInput] = useState("");
  const [caretPosition, setCaretPosition] = useState({ top: 0, left: 0 });
  const [timer, setTimer] = useState(30); // Timer starts at 30 seconds
  const [isTypingAllowed, setIsTypingAllowed] = useState(true); // Control whether typing is allowed
  console.log("isTypingAllowed", isTypingAllowed);
  const [wordCount, setWordCount] = useState(0); // Track number of words typed
  const [hasStartedTyping, setHasStartedTyping] = useState(false); // Flag to track if user has started typing

  const textRef = useRef(null);
  const caretRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fetchAnimeQuote = async () => {
      try {
      let response = await fetch("https://kitsu.io/api/edge/anime?filter[text]=DemonSlayer&page[number]=1&page[size]=10");
      console.log("response", response)
      let data = await response.json();
      console.log("data",data)
      let nextLink = data.links.first || data.links.next || data.links.last ;
        if (nextLink) {
          response = await fetch(nextLink);
          data = await response.json();
          console.log("Next page data:", data);
          
          // Process the new data if needed (e.g., extract another anime quote/synopsis)
          const nextAnime = data.data[0];
          const nextSynopsis = nextAnime.attributes.synopsis;
          setTextToType(prevText => prevText + "\n" + nextSynopsis); // Append synopsis to existing text
        }
      } catch(err) {
        console.log("ERROR", err)
      }
    };

    fetchAnimeQuote();
  }, []);
  // Focus input on component load
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  let interval = useRef(null);
  // Timer countdown logic
  useEffect(() => {
    if (hasStartedTyping && timer > 0) {
      interval.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      if (timer <= 0) {
        setIsTypingAllowed(false);
        clearInterval(interval.current);
      }

      return () => clearInterval(interval.current);
    }
  }, [hasStartedTyping, timer]);

  // Calculate word count when typing or timer ends
  useEffect(() => {
    setWordCount(userInput.trim().split(/\s+/).filter(Boolean).length); // Split by spaces to count words
  }, [userInput]);

  // Update caret position based on user input
  useEffect(() => {
    updateCaretPosition();
  }, [userInput]);

  const updateCaretPosition = () => {
    const spans = textRef.current.querySelectorAll("span");
    const currentSpan = spans[userInput.length];

    // Check if input has reached the last character
    if (currentSpan) {
      const rect = currentSpan.getBoundingClientRect();
      const containerRect = textRef.current.getBoundingClientRect();
      setCaretPosition({
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
      });
    } else if (userInput.length === textToType.length) {
      // If the entire text is typed, position caret after the last character
      const lastChar = spans[spans.length - 1];
      const rect = lastChar.getBoundingClientRect();
      const containerRect = textRef.current.getBoundingClientRect();
      setCaretPosition({
        top: rect.top - containerRect.top,
        left: rect.left + rect.width - containerRect.left,
      });
    }
  };

  const handleInputChange = (e) => {
    const input = e.target.value;

    // Start the timer on the first keystroke
    if (input?.length === textToType?.length || timer <= 0) {
      // setTimer(60);
      clearInterval(interval.current);
      setIsTypingAllowed(false);
    }
    if (!hasStartedTyping) {
      setHasStartedTyping(true);
    }

    if (isTypingAllowed) {
      setUserInput(input.slice(0, textToType.length)); // Limit input to match text length
    }
  };

  const getStyledText = () => {
    return textToType.split("").map((char, index) => {
      const isCorrect = userInput[index] === char;
      const isTyped = index < userInput.length;
      const color = isTyped ? (isCorrect ? "green" : "red") : "gray";
      return (
        <span
          key={index}
          style={{
            color,
            whiteSpace: "pre",
          }}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        width: "100%",
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "black" }}>Typing Tool</h1>

      {/* Timer Display */}
      <div
        style={{ marginBottom: "20px", fontSize: "24px", fontWeight: "bold" }}
      >
        Time Remaining: {timer}s
      </div>

      <div
        style={{
          position: "relative",
          width: "100%",
          fontFamily: "Courier New, monospace",
          fontSize: "2rem",
          lineHeight: "1.5",
          textAlign: "left",
          wordBreak: "break-word",
        }}
      >
        {/* Dynamic Text Display */}
        <p
          ref={textRef}
          style={{
            position: "relative",
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {getStyledText()}
        </p>

        {/* Dynamic Caret */}
        <motion.div
          ref={caretRef}
          animate={{ opacity: [0, 1] }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            ease: "ease-in", // Apply ease-in animation
          }}
          style={{
            position: "absolute",
            top: caretPosition.top,
            left: caretPosition.left,
            backgroundColor: "yellow", // Changed to yellow for visibility
            width: "2px", // Increased width
            height: "1em",
          }}
        />

        {/* Hidden Input to Capture Typing */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          disabled={!isTypingAllowed} // Disable input after 30 seconds
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            opacity: 0,
            width: "100%",
            height: "100%",
            caretColor: "transparent",
          }}
        />
      </div>

      {/* Display the number of words typed */}
      {!isTypingAllowed && (
        <div style={{ marginTop: "20px", fontSize: "18px" }}>
          You typed {wordCount} word{wordCount !== 1 && "s"} in 30 seconds!
        </div>
      )}
    </div>
  );
};

export default TypingOverlayComponent;
