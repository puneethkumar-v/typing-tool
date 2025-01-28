import React from "react";
import PropTypes from "prop-types";

const SpanComponent = React.forwardRef(({ color, char }, ref) => {
  return (
    <span ref={ref} style={{ color, whiteSpace: "pre" }}>
      {char}
    </span>
  );
});

// Add a display name for debugging purposes
SpanComponent.displayName = "SpanComponent";

SpanComponent.propTypes = {
  color: PropTypes.string.isRequired, // Ensures color is a string
  char: PropTypes.string.isRequired, // Ensures char is a string
};

export default SpanComponent;