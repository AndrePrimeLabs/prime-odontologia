export class AppError extends Error {
	constructor(
		message: string,
		readonly status = 500,
		readonly code = "internal_error",
	) {
		super(message)
		this.name = "AppError"
	}
}

export class NotFoundError extends AppError {
	constructor(what = "resource") {
		super(`${what} not found`, 404, "not_found")
	}
}

export class UnauthorizedError extends AppError {
	constructor(message = "unauthorized") {
		super(message, 401, "unauthorized")
	}
}

export class ConfigError extends AppError {
	constructor(message: string) {
		super(message, 500, "config_error")
	}
}

export function isAppError(err: unknown): err is AppError {
	return err instanceof AppError
}