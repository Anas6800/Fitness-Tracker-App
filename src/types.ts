export type Challenge = {
  id: string;
  title: string;
  goal: string;
  duration: number;
  ownerId: string;
  createdAt?: unknown;
};

export type ProgressEntry = {
  id: string;
  challengeId: string;
  userId: string;
  day: number;
  value: number;
  dateLogged?: unknown;
};
