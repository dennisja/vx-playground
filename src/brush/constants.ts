import appleStock from "@vx/mock-data/lib/mocks/appleStock";

export const stock = appleStock.slice(1200);
export const axisColor = "#fff";
export const axisBottomTickLabelProps = {
  textAnchor: "middle" as const,
  fontFamily: "Arial",
  fontSize: 10,
  fill: axisColor
};

export const axisLeftTickLabelProps = {
  dx: "-0.25em",
  dy: "0.25em",
  fontFamily: "Arial",
  fontSize: 10,
  textAnchor: "end" as const,
  fill: axisColor
};
