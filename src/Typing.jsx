import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import animeNames from "./data";

const TypingOverlayComponent = () => {
  const [textToType, setTextToType] = useState("Demo");
  const [userInput, setUserInput] = useState("");
  const [caretPosition, setCaretPosition] = useState({ top: 0, left: 0 });
  const [timer, setTimer] = useState(30);
  const [isTypingAllowed, setIsTypingAllowed] = useState(true);
  const [wordCount, setWordCount] = useState(0);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);

  const textRef = useRef(null);
  const caretRef = useRef(null);
  const inputRef = useRef(null);

  // List of anime names for dynamic selection

  // Fetch random anime quote
  const fetchAnimeQuote = useMemo(() => async () => {
    try {
      // Select a random anime name
      const randomAnime = animeNames[Math.floor(Math.random() * animeNames.length)];
      const apiUrl = `https://kitsu.io/api/edge/anime?filter[text]=${randomAnime}&page[number]=1&page[size]=2`;

      const response = await fetch(apiUrl);
      const data = await response.json();

      const firstAnime = data.data?.[0];
      const synopsis = firstAnime?.attributes?.synopsis || "No synopsis available.";

      setTextToType(synopsis);
    } catch (err) {
      console.error("Error fetching anime quote:", err);
    }
  }, []);

  useEffect(() => {
    fetchAnimeQuote();
  }, [fetchAnimeQuote]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let interval = null;
    if (hasStartedTyping && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);

      if (timer <= 0) {
        setIsTypingAllowed(false);
        clearInterval(interval);
      }
    }
    return () => clearInterval(interval);
  }, [hasStartedTyping, timer]);

  useEffect(() => {
    setWordCount(userInput.trim().split(/\s+/).filter(Boolean).length);
  }, [userInput]);

  useEffect(() => {
    updateCaretPosition();
  }, [userInput]);

  const updateCaretPosition = () => {
    const spans = textRef.current.querySelectorAll("span");
    const currentSpan = spans[userInput.length];

    if (currentSpan) {
      const rect = currentSpan.getBoundingClientRect();
      const containerRect = textRef.current.getBoundingClientRect();
      setCaretPosition({
        top: rect.top - containerRect.top,
        left: rect.left - containerRect.left,
      });
    } else if (userInput.length === textToType.length) {
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

    if (input?.length === textToType?.length || timer <= 0) {
      setIsTypingAllowed(false);
    }

    if (!hasStartedTyping) {
      setHasStartedTyping(true);
    }

    if (isTypingAllowed) {
      setUserInput(input.slice(0, textToType.length));
    }
  };

  const getStyledText = () => {
    return textToType.split("").map((char, index) => {
      const isCorrect = userInput[index] === char;
      const isTyped = index < userInput.length;
      const color = isTyped ? (isCorrect ? "green" : "red") : "gray";
      return (
        <span key={index} style={{ color, whiteSpace: "pre" }}>
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
      <h1>Typing Tool</h1>

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
          maxHeight: "150px",
          overflowY: "scroll",
          overflowX: "hidden",
        }}
      >
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

        <motion.div
          ref={caretRef}
          animate={{ opacity: [0, 1] }}
          transition={{
            repeat: Infinity,
            duration: 0.8,
            ease: "ease-in",
          }}
          style={{
            position: "absolute",
            top: caretPosition.top,
            left: caretPosition.left,
            backgroundColor: "yellow",
            width: "2px",
            height: "1em",
          }}
        />

        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInputChange}
          disabled={!isTypingAllowed}
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

      {!isTypingAllowed && (
        <div style={{ marginTop: "20px", fontSize: "18px" }}>
          You typed {wordCount} word{wordCount !== 1 && "s"} in 30 seconds!
        </div>
      )}
    </div>
  );
};

export default TypingOverlayComponent;
