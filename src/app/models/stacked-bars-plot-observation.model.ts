import { ObservationModel } from "./observation.model";

// each observation will be of format:
// {
//   xField: "economic";
//   stackedBarsField: "Asia"
//   mean_Yfield: "30"
// }
// let's assume that xField is pestle, yField is intensity and stackedBarsField is sector
//the above data point can be understood as: for all observations whose pestle is economic
//and region is asia, the mean intensity is 30.
export type StackedBarsPlotObservationModel = Partial<ObservationModel> & {[key: string]: number};