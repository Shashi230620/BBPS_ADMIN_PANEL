import { forwardRef } from "react";
import PropTypes from "prop-types";

// Custom styles for MDButton
import MDButtonRoot from "components/MDButton/MDButtonRoot";

// Material Dashboard 2 React contexts
import { useMaterialUIController } from "context";

const MDButton = forwardRef(
  ({ color, variant, size, circular, iconOnly, children, ...rest }, ref) => {
    const [controller] = useMaterialUIController();
    const { darkMode } = controller;

    return (
      <MDButtonRoot
        {...rest}
        ref={ref}
        color={color}
        variant={variant === "gradient" ? "contained" : variant}
        size={size}
        ownerState={{ color, variant, size, circular, iconOnly, darkMode }}
      >
        {children}
      </MDButtonRoot>
    );
  }
);

// Default props
MDButton.defaultProps = {
  size: "medium",
  variant: "contained",
  color: "white",
  circular: false,
  iconOnly: false,
};

// Prop types
MDButton.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["text", "contained", "outlined", "gradient"]),
  color: PropTypes.oneOf([
    "white",
    "primary",
    "secondary",
    "info",
    "success",
    "warning",
    "error",
    "light",
    "dark",
  ]),
  circular: PropTypes.bool,
  iconOnly: PropTypes.bool,
  onClick: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default MDButton;
