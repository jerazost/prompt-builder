import "./App.css";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useState } from "react";
import { PromptPartial } from "./components/PromptPartial";
import update from "immutability-helper";
import { v4 as uuidv4 } from "uuid";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CopyIcon from "@mui/icons-material/FileCopy";
import { useCopyToClipboard } from "./hooks/useCopyToClipBoard";
import { useLocalStorage } from "./hooks/useLocalStorage";

const testValues = [
  {
    id: uuidv4(),
    variableName: "subject",
    promptTexts: ["large man", "large woman", "small man", "small woman"],
  },
  {
    id: uuidv4(),
    variableName: "setting",
    promptTexts: ["in a bar", "in a sauna", "at an airport", "at a park"],
  },
  {
    id: uuidv4(),
    variableName: "action",
    promptTexts: ["drinking", "running", "flying", "eating"],
  },
];

interface IPromptPartial {
  id: string;
  variableName: string;
  promptTexts: string[];
}

function App() {
  const [copyValue, copy] = useCopyToClipboard();
  const [promptObjects, setPromptObjects] = useLocalStorage<IPromptPartial[]>(
    "prompts",
    testValues
  );
  const [permutations, setPermutations] = useState<string[]>([]);
  const shufflePermutations = () => {
    const newPermutations = [...permutations];
    for (let i = permutations.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newPermutations[i], newPermutations[j]] = [
        newPermutations[j],
        newPermutations[i],
      ];
    }
    setPermutations(newPermutations);
  };
  const createPermutations = () => {
    const variableMap = promptObjects.reduce((acc, promptObject) => {
      return acc.set(
        promptObject.variableName,
        promptObject.promptTexts.filter((text) => text)
      );
    }, new Map<string, string[]>());
    const variableNames = [...variableMap.keys()];
    const newPermutations: string[] = [];

    const generatePermutations = (
      index: number,
      currentPermutation: string
    ) => {
      if (index === variableNames.length) {
        newPermutations.push(currentPermutation.trim().slice(0, -1));
        return;
      }

      const variableName = variableNames[index];
      const promptTexts = variableMap.get(variableName)!;

      for (let i = 0; i < promptTexts.length; i++) {
        generatePermutations(
          index + 1,
          currentPermutation + promptTexts[i] + ", "
        );
      }
    };

    generatePermutations(0, "");
    setPermutations(newPermutations);
  };

  const addPrompt = () => {
    const newPrompt = {
      id: uuidv4(),
      variableName: "",
      promptTexts: [""],
    };
    setPromptObjects([...promptObjects, newPrompt]);
  };

  const addPromptText = (id: string) => {
    const itemSearchResult = findItem(id);
    if (!itemSearchResult) {
      return;
    }
    const { index } = itemSearchResult;
    const newPrompts = update(promptObjects, {
      [index]: {
        promptTexts: {
          $push: [""],
        },
      },
    });
    setPromptObjects([...newPrompts]);
  };

  const findItem = (id: string): { item: any; index: number } | null => {
    const itemIndex = promptObjects.findIndex((item) => item.id === id);
    if (itemIndex === -1) {
      return null;
    }
    return {
      item: promptObjects[itemIndex],
      index: itemIndex,
    };
  };

  const moveItem = (id: string, atIndex: number) => {
    const itemSearchResult = findItem(id);
    if (!itemSearchResult) {
      return;
    }
    const { item, index } = itemSearchResult;
    const newPrompts = update(promptObjects, {
      $splice: [
        [index, 1],
        [atIndex, 0, item],
      ],
    });
    setPromptObjects([...newPrompts]);
  };

  return (
    <Box className="App">
      <Box sx={{ display: "flex", justifyContent: "flex-start", p: 2 }}>
        <Box className="Toolbar">
          <Button onClick={addPrompt}>Add Prompt</Button>
          <Button onClick={createPermutations}>Create Permutations</Button>
          <Button onClick={shufflePermutations}>Shuffle Permutations</Button>
        </Box>
      </Box>
      <Box sx={{ display: "flex", gap: 2, p: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            p: 2,
            flexDirection: "column",
          }}
        >
          {promptObjects.map(({ variableName, promptTexts, id }, index) => {
            return (
              <PromptPartial
                variableName={variableName}
                promptTexts={promptTexts}
                setVariableName={(value) => {
                  const newPrompts = [...promptObjects];
                  newPrompts[index].variableName = value;
                  setPromptObjects(newPrompts);
                }}
                setPromptText={(value, i) => {
                  const newPrompts = [...promptObjects];
                  newPrompts[index].promptTexts[i] = value;
                  setPromptObjects(newPrompts);
                }}
                handleDelete={() =>
                  setPromptObjects(
                    [...promptObjects].filter((_, i) => i !== index)
                  )
                }
                deletePromptText={(i) => {
                  const newPrompts = [...promptObjects];
                  newPrompts[index].promptTexts.splice(i, 1);
                  setPromptObjects(newPrompts);
                }}
                handleMoveItem={(newIndex) => {
                  moveItem(id, newIndex);
                }}
                addPromptText={() => addPromptText(id)}
              ></PromptPartial>
            );
          })}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "70rem",
            overflow: "auto",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <Typography>
              {permutations.length === 0
                ? ""
                : "Permutations: " + permutations.length + "\n"}
            </Typography>
            <IconButton
              disabled={
                !typeof navigator.clipboard || permutations.length === 0
              }
              onClick={() => copy(permutations.join("\n"))}
            >
              <CopyIcon />
            </IconButton>
          </Box>
          <pre>
            <code>
              {permutations.reduce(
                (acc, cur) => `${acc.trim()}\n${cur.trim()}`,
                ""
              )}
            </code>
          </pre>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
