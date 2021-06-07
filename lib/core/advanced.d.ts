import { MegaClient } from "core";
import { Schema$File } from "types";
import Files from "./files";
export default class GoldenPark extends Files {
    constructor(ctx: MegaClient);
    girls(): Schema$File[];
}
