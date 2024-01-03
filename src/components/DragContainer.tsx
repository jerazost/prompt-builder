import { useDrag, useDrop } from "react-dnd";
/**
 * @typedef {object} IPromptPartial
 * @property {string} variableName - The variable name
 * @property {string} promptText - The prompt text
 */

/**
 * Interface for DraggableItemProps
 */
interface IDraggableItemProps {
  /** The id of the draggable item */
  id: string;
  /** Function to move the item */
  onMoveItem: (id: string, atIndex: number) => void;
  /** The children of the draggable item */
  children: JSX.Element;
  /** Function to find the item */
  findItem: (id: string) => { item: any; index: number } | null;
}

/**
 * DraggableItem component
 * @param {T} props - The props of the draggable item
 * @template T
 */
export const DraggableItem: React.FC<IDraggableItemProps> = ({
  id,
  onMoveItem,
  children,
  findItem,
}) => {
  const foundItem = findItem(id) ?? { item: null, index: -1 };
  const [{ isDragging }, drag] = useDrag({
    item: { type: "DraggableItem", id, originalIndex: foundItem.index },
    type: "DraggableItem",
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (dropResult: any, monitor: any) => {
      const { id: droppedId, originalIndex } = monitor.getItem();
      const didDrop = monitor.didDrop();
      if (didDrop) {
        const dropResult = monitor.getDropResult();
        const newIndex = dropResult.newIndex;
        onMoveItem(droppedId, newIndex);
      } else {
        onMoveItem(droppedId, originalIndex);
      }
    },
  });
  const opacity = isDragging ? 0 : 1;
  return (
    <div ref={drag} id={id} style={{ opacity }}>
      {children}
    </div>
  );
};

/**
 * Interface for DragContainerProps
 */
interface IDragContainerProps {
  /** The children of the drag container */
  children: JSX.Element[];
  /** Function to move the item */
  onMoveItem: (id: string, atIndex: number) => void;
  /** Function to find the item */
  findItem: (id: string) => { item: any; index: number } | null;
}

/**
 /**
  * DragContainer component
  * @param {IDragContainerProps} props - The props of the drag container
  * @param {JSX.Element[]} props.children - The children of the drag container
  * @param {(id: string, atIndex: number) => void} props.onMoveItem - Function to move the item
  * @param {(id: string) => { item: any, index: number }} props.findItem - Function to find the item
  */
export const DragContainer: React.FC<IDragContainerProps> = ({
  children,
  onMoveItem,
  findItem,
}) => {
  const [, drop] = useDrop(() => ({
    accept: "DraggableItem",
    hover: async (item: { id: string; type: string }, monitor) => {
      const { id: draggedId } = item;
      const foundItem = findItem(draggedId);
      if (!foundItem) {
        return;
      }
    },
    drop: (item: { id: string; type: string }, monitor) => {
      const { id: droppedId } = item;
      const foundItem = findItem(droppedId);
      if (!foundItem) {
        return;
      }
      const { index: droppedIndex } = foundItem;
      return { newIndex: droppedIndex };
    },
  }));
  return <div ref={drop}>{children}</div>;
};
