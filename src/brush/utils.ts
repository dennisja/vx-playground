import { AppleStock } from "@vx/mock-data/lib/mocks/appleStock";
import { axisLeftTickLabelProps, axisBottomTickLabelProps } from "./constants";

export const getLeftAxisTickLabelProps = () => axisLeftTickLabelProps;

export const getDate = (d: AppleStock) => new Date(d.date);

export const getStockValue = (d: AppleStock) => d.close;

export const getBottonAxisTickLableProps = () => axisBottomTickLabelProps;
