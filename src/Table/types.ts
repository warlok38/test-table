export type UserEntity = {
  name: string;
  position: string;
};

export type MockDataEntity = {
  id: number;
  date: string;
  shift: string;
  user: UserEntity;
  jobCode: string;
  staffTitle: string;
  staffCount: string;
  code: string;
  status: string;
  count: number;
  markCode: string;
  percentage: number;
  note: string;
  comment: string;
};

export type FormValuesType = Omit<MockDataEntity, "id" | "user"> & UserEntity;
