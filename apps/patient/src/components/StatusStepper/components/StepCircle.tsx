import { Circle, Icon, SquareProps } from "@chakra-ui/react";
import { HiCheck } from "react-icons/hi";

interface RadioCircleProps extends SquareProps {
  isCompleted: boolean;
  isActive: boolean;
}

export const StepCircle = (props: RadioCircleProps) => {
  const { isCompleted, isActive } = props;
  return (
    <Circle
      size="8"
      bg={isCompleted ? "green" : "inherit"}
      borderWidth={isCompleted ? "0" : "2px"}
      borderColor={isActive ? "green" : "inherit"}
    >
      {isCompleted ? (
        <Icon as={HiCheck} color="white" boxSize="5" />
      ) : (
        <Circle bg={isActive ? "green" : "border"} size="3" />
      )}
    </Circle>
  );
};
