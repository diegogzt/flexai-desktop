import { GlobalConfig } from '@n8n/config';
import { AuthenticatedRequest } from '@n8n/db';
import { NextFunction, Response } from 'express';
export declare class PostHogController {
    private readonly globalConfig;
    proxy: import("http-proxy-middleware").RequestHandler<import("http").IncomingMessage, import("http").ServerResponse<import("http").IncomingMessage>, (err?: any) => void>;
    constructor(globalConfig: GlobalConfig);
    capture(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    decide(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    sessionRecording(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    sessionEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    engage(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    batch(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    flags(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void>;
    staticArrayJs(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
    staticLazyRecorderJs(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
    arrayConfig(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
}
