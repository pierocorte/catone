import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class OpenApiHttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const res = ctx.getResponse<Response>();

        if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const resp = exception.getResponse() as any;

            const message =
                typeof resp === "string"
                    ? resp
                    : typeof resp?.message === "string"
                        ? resp.message
                        : Array.isArray(resp?.message)
                            ? resp.message.join("; ")
                            : exception.message || "Error";

            const errors = typeof resp === "object" ? [resp] : undefined;

            res.status(status).json({ message, errors });
            return;
        }

        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
}
