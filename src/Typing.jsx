import { useCallback, useEffect, useRef, useState } from "react";
import Stack from "./utils/collections/Stack";
import animeNames from "./data";
import { ETextColor } from "./utils/enums/cssEnums";
import SpanComponent from "./components/SpanComponent";
import { motion } from "framer-motion";

export default function TypingOverlayComponent() {
  const FIXED_TIME = Number(import.meta.env.VITE_TEST_DURATION_IN_SECONDS) || 30;
  const TYPABLE_PARENT_Y_PADDING = 10;
  const TYPABLE_PARENT_X_PADDING = 20;

  const unTypedRef = useRef(Stack());
  const typedRef = useRef(Stack());
  const inputRef = useRef(null);
  const autoScrollFocusRef = useRef(null);
  const interval = useRef(null);
  const textRef = useRef(null);

  const [timer, setTimer] = useState(FIXED_TIME);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [userInput, setUserInput] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [typable, setTypable] = useState([]);
  const [caretPosition, setCaretPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    setWordCount(userInput.trim().split(/\s+/).filter(Boolean).length);
  }, [userInput]);

  // This runs the timer
  useEffect(() => {
    if (hasStartedTyping && timer > 0) {
      interval.current = setInterval(() => {
        setElapsedTime(FIXED_TIME - timer.valueOf() + 1);
        setTimer((prev) => prev - 1);
      }, 1000);

      if (unTypedRef.current.isEmpty() || timer <= 0) {
        clearInterval(interval.current);
      }
    }
    return () => clearInterval(interval.current);
  }, [hasStartedTyping, timer]);

  // Clear typed and unTyped stacks
  useEffect(() => {
    unTypedRef.current.clear();
    typedRef.current.clear();
  }, []);

  const updateTypable = (index, newValue) => {
    setTypable((prev) => {
      const updatedArray = [...prev]; // Create a copy of the array
      updatedArray[index] = newValue; // Update the specific index
      return updatedArray; // Return the updated array
    });
  };

  // Autoscroll to set typable character in the middle
  useEffect(() => {
    autoScrollFocusRef.current?.scrollIntoView({
      behavior: "instant",
      block: "center",
    });
  }, [typable]);

  const generateTypableSpan = useCallback((text) => {
    try {
      const array = text.split("");
      return array.map((char, index) => {
        // autoScrollFocusRef is set to firstElement
        const firstElement = index == 0;

        return (
          <SpanComponent key={index} color={ETextColor.UNTYPED} char={char}
            ref={ firstElement ? (rf) => { autoScrollFocusRef.current = rf; } : null }
          />
        );
      });
    } catch (err) {
      console.error("Error while generating span: ", err);
      // Optionally, set some state to indicate an error
      setTypable(
        <SpanComponent key={0} color={ETextColor.UNTYPED} 
          char="Failed to generate character span. Please try again."
        />
      );
    }
  }, []);

  const getAnimeSynopsis = useCallback(async () => {
    try {
      // Select a random anime name
      const randomAnimeName = animeNames[Math.floor(Math.random() * animeNames.length)];
      // Encodes a text string as a valid component of a Uniform Resource Identifier (URI)
      const encodedAnimeName = encodeURIComponent(randomAnimeName);

      const apiUrl = `https://kitsu.io/api/edge/anime?filter[text]=${encodedAnimeName}&page[number]=1&page[size]=2`;

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      const firstAnime = data.data?.[0];
      const synopsis = firstAnime?.attributes?.synopsis || "No synopsis available.";
      return synopsis;
    } catch (err) {
      console.error("Error fetching anime quote: ", err);
      // Optionally, set some state to indicate an error
      setTypable(
        <SpanComponent key={0} color={ETextColor.UNTYPED}
          char="Failed to fetch anime quote. Please try again."
        />
      );
    }
  }, []);

  const fetchAnimeQuote = useCallback(async () => {
    try {
      const synopsis = await getAnimeSynopsis();
      const typableSpan = generateTypableSpan(synopsis);
      // Reverse typableSpan and stack it as unTyped
      for (let i = typableSpan.length - 1; i >= 0; i--) unTypedRef.current.push(typableSpan[i]);
      // This will be displayed on screen
      setTypable(typableSpan);
    } catch (err) {
      console.error("Error during stack operation: ", err);
      // Optionally, set some state to indicate an error
      setTypable(
        <SpanComponent key={0} color={ETextColor.UNTYPED}
          char="Stack operation failed. Please try again."
        />
      );
    }
  }, [generateTypableSpan, getAnimeSynopsis]);

  useEffect(() => {
    fetchAnimeQuote();
  }, [fetchAnimeQuote]);

  const checkTyped = useCallback((typedChar) => {
    // Returns if there is nothing to type
    if (unTypedRef.current.isEmpty()) {
      return;
    }
    const unTypedCharSpan = unTypedRef.current.pop();

    const spanKey = unTypedCharSpan.key;
    const unTypedChar = unTypedCharSpan.props.char;

    let color = "";

    if (typedChar === unTypedChar) {
      // Character match
      color = ETextColor.CORRECT;
    } else {
      // Character mismatch
      color = ETextColor.WRONG;
    }
    const typedCharSpan = (
      <SpanComponent key={spanKey} color={color} char={unTypedChar} 
        ref={(rf) => { autoScrollFocusRef.current = rf; }}
      />
    );

    typedRef.current.push(typedCharSpan);
    updateTypable(spanKey, typedCharSpan);
  }, []);

  const handleBackSpace = useCallback(() =>   {
    const typedCharSpan = typedRef.current.pop();
    const spanKey = typedCharSpan.key;
    const typedChar = typedCharSpan.props.char;

    // Converting typed to unTypedCharSpan
    const unTypedCharSpan = (
      <SpanComponent key={spanKey} color={ETextColor.UNTYPED} char={typedChar}
        ref={(rf) => { autoScrollFocusRef.current = rf; }}
      />
    );

    unTypedRef.current.push(unTypedCharSpan);
    updateTypable(spanKey, unTypedCharSpan);
  }, []);

  const handleInputChange = (e) => {
    e.preventDefault();
    if (!hasStartedTyping) {
      setHasStartedTyping(true);
    }
    const inputText = e.target.value;
    // Backspace was clicked
    if (inputText.length < typedRef.current.size()) {
      handleBackSpace();
    } else {
      const typedChar = inputText[inputText.length - 1];
      checkTyped(typedChar);
    }
    if (!(unTypedRef.current.isEmpty() || timer <= 0)) {
      setUserInput( inputText.slice(0, unTypedRef.current.size() + typedRef.current.size()) );
    }
  };

  const setFocusOnInput = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Sets focus on input as soon as page loads
  useEffect(() => {
    setFocusOnInput();
  }, [setFocusOnInput, unTypedRef.current.size()]);

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
    } else if ( userInput.length === unTypedRef.current.size() + typedRef.current.size() ) {
      const lastChar = spans[spans.length - 1];
      const rect = lastChar.getBoundingClientRect();
      const containerRect = textRef.current.getBoundingClientRect();
      setCaretPosition({
        top: rect.top - containerRect.top,
        left: rect.left + rect.width - containerRect.left,
      });
    }
  };

  useEffect(() => {
    updateCaretPosition();
  }, [userInput]);

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
        onClick={setFocusOnInput}
        style={{
          position: "relative",
          width: "100%",
          fontFamily: "Courier New, monospace",
          fontSize: "2rem",
          lineHeight: "1.5",
          paddingBlock: TYPABLE_PARENT_Y_PADDING, // Y-axis padding (top and bottom)
          paddingInline: TYPABLE_PARENT_X_PADDING, // X-axis padding (left and right)
          textAlign: "left",
          wordBreak: "break-word",
          maxHeight: "150px",
          overflowY: "scroll",
          overflowX: "hidden",
          border: "2px solid black",
          borderRadius: "10px 0px 0px 10px",
        }}
      >
        <div
          ref={textRef}
          style={{
            position: "relative",
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          {typable.length > 0 ? ( typable ) 
          : (
            <SpanComponent key={0} color={ETextColor.UNTYPED} char="Loading text..."/>
          )}
        </div>
        {!(unTypedRef.current.isEmpty() || timer <= 0) && (
          <motion.div
            animate={{ opacity: [0, 1] }}
            transition={{
              repeat: Infinity,
              duration: 0.8,
              ease: "easeIn",
            }}
            style={{
              position: "absolute",
              top: caretPosition.top + TYPABLE_PARENT_Y_PADDING,
              left: caretPosition.left + TYPABLE_PARENT_X_PADDING,
              backgroundColor: "yellow",
              width: "2px",
              height: "1em",
            }}
          />
        )}
      </div>

      <input
        ref={inputRef}
        type="text"
        onChange={handleInputChange}
        disabled={unTypedRef.current.isEmpty() || timer <= 0}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          opacity: 0,
          width: "0%",
          height: "0%",
          caretColor: "transparent",
        }}
      />

      {(unTypedRef.current.isEmpty() || timer <= 0) && (
        <div style={{ marginTop: "20px", fontSize: "18px" }}>
          You typed {wordCount} word{wordCount !== 1 && "s"} in {elapsedTime} seconds!
        </div>
      )}
    </div>
  );
}