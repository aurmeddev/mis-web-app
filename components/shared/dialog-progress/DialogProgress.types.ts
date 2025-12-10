interface DialogProgressProps {
  texts: {
    currentItemTitle: string;
    actionType: string;
    itemsLabel: string;
  };
  open: boolean;
  onOpen?: (open: boolean) => void;
  progress: number;
  itemsLength: number;
}

export type { DialogProgressProps };
