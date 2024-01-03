import { FC, ChangeEvent } from "react";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";

/**
 * @interface IPromptPartialProps
 *
 * @description
 * Props interface for the PromptPartial component.
 */
interface IPromptPartialProps {
  /**
   * @description
   * The variable name.
   */
  variableName: string;

  /**
   * @description
   * The prompt text.
   */
  promptTexts: string[];

  /**
   * @description
   * Handler to set the variable name.
   */
  setVariableName: (value: string) => void;

  /**
   * @description
   * Handler to set the prompt text.
   */
  setPromptText: (value: string, i: number) => void;

  /**
   * @description
   * Handler to delete the prompt.
   */
  handleDelete: () => void;

  deletePromptText: (i: number) => void;
  addPromptText: () => void;
}

/**
 * @function PromptPartial
 *
 * @param {IPromptPartialProps} props - The props for the component.
 *
 * @returns {JSX.Element}
 *
 * @example
 * <PromptPartial
 *   variableName="exampleVariable"
 *   promptText="examplePrompt"
 *   setVariableName={setExampleVariable}
 *   setPromptText={setExamplePrompt}
 *   handleDelete={deleteExamplePrompt}
 * />
 */
export const PromptPartial: FC<IPromptPartialProps> = ({
  variableName,
  promptTexts,
  setVariableName,
  setPromptText,
  addPromptText,
  deletePromptText,
  handleDelete,
}) => {
  const handleVariableNameChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setVariableName(event.target.value);
  };

  const handlePromptTextChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    i: number
  ) => {
    setPromptText(event.target.value, i);
  };

  const handleDeletePromptText = (i: number) => {
    deletePromptText(i);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        border: "1px solid",
        borderRadius: 1,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <TextField
          label="Variable Name"
          value={variableName}
          size="small"
          onChange={handleVariableNameChange}
          sx={{ flexGrow: 1 }}
        />
        <IconButton onClick={addPromptText}>
          <AddIcon />
        </IconButton>
        <IconButton onClick={handleDelete}>
          <DeleteIcon />
        </IconButton>
      </Box>
      {promptTexts.map((text: string, i: number) => (
        <Box
          key={i}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <IconButton onClick={() => handleDeletePromptText(i)}>
            <ClearIcon />
          </IconButton>
          <TextField
            sx={{ flexGrow: 1 }}
            size="small"
            label={`Variant ${i + 1}`}
            value={text}
            onChange={(
              e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
            ) => handlePromptTextChange(e, i)}
            multiline
          />
        </Box>
      ))}
    </Box>
  );
};
