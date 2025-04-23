export interface Lesson {
  id: string;
  title: string;
  path: string;
}

export interface Chapter {
  id: string;
  title: string;
  path: string;
  lessons: Lesson[];
}
