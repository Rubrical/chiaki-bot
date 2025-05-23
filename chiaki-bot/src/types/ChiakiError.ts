export class ChiakiError extends Error {
    public readonly message: string;
    public readonly code: number;

    constructor(message: string, code?: number) {
        super(message);
        this.message = message;
        this.code = code;
    }
}