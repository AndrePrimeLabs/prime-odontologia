import type { RequestHandler } from "express"
import type { ZodTypeAny, z } from "zod"
import { AppError } from "./errors.js"

type Source = "body" | "query" | "params"

/** Validate part of a request against a Zod schema, replacing it with the parsed value. */
export function validate(source: Source, schema: ZodTypeAny): RequestHandler {
	return (req, _res, next) => {
		const result = schema.safeParse(req[source])
		if (!result.success) {
			const detail = result.error.issues
				.map((i) => `${i.path.join(".") || source}: ${i.message}`)
				.join("; ")
			return next(new AppError(detail, 400, "validation_error"))
		}
		Object.assign(req, { [source]: result.data })
		next()
	}
}

export function parseOrThrow<T extends ZodTypeAny>(
	schema: T,
	value: unknown,
): z.infer<T> {
	const result = schema.safeParse(value)
	if (!result.success) {
		throw new AppError(result.error.message, 400, "validation_error")
	}
	return result.data
}