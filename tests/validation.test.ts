import { z } from "zod"

describe("zod", () => {
	it("example string validations", () => {
		const schema: z.ZodString = z.string().max(5).min(3)
		const request: string = "irda"
		const result: string = schema.parse(request)
		expect(result).toBe("irda")
	})

	it("validate primitive data type", () => {
		const user = {
			email: z.string().email(),
			isAdmin: z.boolean(),
			balance: z.number().min(100).max(10_000_000),
		}

		expect(user.email.parse("i@gmail.com")).toBe("i@gmail.com")
		expect(user.isAdmin.parse(true)).toBe(true)
		expect(user.balance.parse(10_000)).toBe(10_000)
	})

	it("test auto conversion data type", () => {
		const user = {
			name: z.coerce.string().min(3).max(10),
			isAdmin: z.coerce.boolean(),
			balance: z.coerce.number().min(100).max(10_000_000),
		}

		expect(user.name.parse(123)).toBe("123")
		expect(user.name.parse(true)).toBe("true")
		expect(user.isAdmin.parse("123")).toBe(true)
		expect(user.isAdmin.parse(null)).toBe(false)
		expect(user.isAdmin.parse("true")).toBe(true)
		expect(user.balance.parse(100)).toBe(100)
		expect(user.balance.parse("100000")).toBe(100_000)
	})
})