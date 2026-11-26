import type { Request } from "express";
import * as core from "express-serve-static-core";

export interface TypedRequestBody<T> extends Request {
    body: T,
    params: core.ParamsDictionary
}
