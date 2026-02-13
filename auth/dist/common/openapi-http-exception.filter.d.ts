import { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
export declare class OpenApiHttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost): void;
}
