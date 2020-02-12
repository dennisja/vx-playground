export type Margin = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type ShowProvidedProps = {
  width: number;
  height: number;
  margin: Margin;
  events?: boolean;
};
