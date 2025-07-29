import { Request, Response } from "express";
import { CreateDTO } from "../types/asset.type";

export class AssetController {
    static async create(req: Request<{}, {}, CreateDTO>, res: Response) {
        
    }
}