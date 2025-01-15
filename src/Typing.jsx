import React, { useState, useEffect, useRef } from "react";

const TypingOverlayComponent = () => {
  const textToType = "The quick brown fox jumps over the lazy dog.";
  const [userInput, setUserInput] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  
  const inputRef = useRef(null);

  // Focus on input when the component loads
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    const input = e.target.value;
    setUserInput(input);

    // Update cursor position to prevent overflow typing
    setCursorPosition(Math.min(input.length, textToType.length));
  };

  const getStyledText = () => {
    return textToType.split("").map((char, index) => {
      const isCorrect = userInput[index] === char;
      const isTyped = index < userInput.length;
      const color = isTyped ? (isCorrect ? "green" : "red") : "gray";
      
      return (
        <span key={index} style={{ color }}>
          {char}
        </span>
      );
    });
  };

  return (
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "800px",
          fontFamily: "Courier New, monospace",
          fontSize: "18px",
          lineHeight: "1.5",
        }}
      >
        {/* Display reference text */}
        <p
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            color: "#d3d3d3", // Light gray for reference text
            pointerEvents: "none",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {textToType}
        </p>

        {/* Display dynamic user input */}
        <p
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {getStyledText()}
        </p>

        {/* Hidden input to capture user typing */}
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            opacity: 0,
            width: "100%",
            height: "100%",
            caretColor: "black",
          }}
        />
      </div>
  );
};

export default TypingOverlayComponent;
