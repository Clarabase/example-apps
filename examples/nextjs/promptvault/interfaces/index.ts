export type Prompt = {
  id?: string;
  category: Category;
  content: string;
  example_output: string;
  tags: string[];
  title: string;
};
export enum Category {
  Art = "art",
  Coding = "coding",
  Writing = "writing",
}
