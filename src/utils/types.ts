// Define the KnowledgeBase type
export type KnowledgeBase = {
  knowledge: {
    question: string;
    answer: string;
  }[];
};

// Define the Payload structure
type Creator = {
  id: string;
  label: string;
};

export type DataToUpdate = {
  id: string;
  addedDate: number;
  editor: string | null;
  isOpened: boolean;
  isApproved: boolean;
  modifiedDate: number;
  needReview: boolean;
  question: string;
  answer: string;
  selectedCategories: string[];
  creator: Creator;
};

type CurrentUser = {
  id: string;
  label: string;
  role: string;
};

export type ApiPayload = {
  dataToUpdate: DataToUpdate[];
  currentUser: CurrentUser;
};

export type TrainPayload = {
    approvedPairs: {
      id: string;
      question: string;
      answer: string;
    }[];
    currentUser: {
      id: string;
      label: string;
      role: "ADMIN" | string;
    };
  };
