import { IPostbackTrackingParams } from "../../postback/IPostbackTrackingParams";

interface IPixelDebugger {
  debug(params: IPostbackTrackingParams): Promise<{ result: string }>;
}

export type { IPixelDebugger };
