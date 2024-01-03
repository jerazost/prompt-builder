import "./App.css";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useState } from "react";
import { PromptPartial } from "./components/PromptPartial";
import { DragContainer, DraggableItem } from "./components/DragContainer";
import update from "immutability-helper";
import { v4 as uuidv4 } from "uuid";
import { Box } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import CopyIcon from "@mui/icons-material/FileCopy";

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
  const [promptObjects, setPromptObjects] =
    useState<IPromptPartial[]>(testValues);
  const [permutations, setPermutations] = useState<string[]>([]);
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
    const { item, index } = itemSearchResult;
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
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };
  return (
    <div className="App">
      <Typography variant="h3" component="h1" gutterBottom>
        Prompt Builder
      </Typography>
      <div className="Toolbar">
        <Button onClick={addPrompt}>Add Prompt</Button>
        <Button onClick={createPermutations}>Create Permutations</Button>
      </div>
      <Box className="Workspace">
        <DragContainer onMoveItem={moveItem} findItem={findItem}>
          {promptObjects.map(({ variableName, promptTexts, id }, index) => {
            return (
              <DraggableItem
                id={id}
                onMoveItem={moveItem}
                findItem={findItem}
                key={id}
              >
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
                  addPromptText={() => addPromptText(id)}
                ></PromptPartial>
              </DraggableItem>
            );
          })}
        </DragContainer>
        <Box>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <Typography>
              {permutations.length === 0
                ? ""
                : "Permutations:" + permutations.length + "\n"}
            </Typography>
            <IconButton>
              <CopyIcon
                onClick={() => copyToClipboard(permutations.join("\n"))}
              />
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
    </div>
  );
}

export default App;
