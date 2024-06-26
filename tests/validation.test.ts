import { z, ZodError } from "zod"

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

	it("date validation", () => {
		const birthDateSceme = z.coerce.date()
			.min(new Date(2000, 0, 1), { message: "too old!" }) // 01 Jan 2000
			.max(new Date(2024, 11, 31), { message: "too young!" }) // 31 Dec 2024

		expect(birthDateSceme.parse("2002-01-01")).toStrictEqual(new Date(2002, 0, 2, -17)) // 01 Jan 2002
	})

	it("handle validation errors", () => {
		const emailSchema = z.string().email().min(3).max(10)

		try {
			emailSchema.parse("xx")
		} catch (err) {
			if (err instanceof ZodError) {
				err.errors.forEach(err => console.log(err.message))
			}
		}
	})

	it("handle validation errors without exception", () => {
		const emailSchema = z.string().email().min(3).max(10)

		const result = emailSchema.safeParse("xx")

		if (result.success) {
			console.log(result.data)
		} else {
			result.error.errors.forEach(async (err) => console.log(err.message))
		}
	})

	it("validate object", () => {
		const loginSchema = z.object({
			username: z.string().email().min(3),
			password: z.string().min(6).max(10),
		})

		const request = {
			username: "i@gmail.com",
			password: "123456",
			ignore: "ignore this",
			name: "xx" // ignore
		}

		const result = loginSchema.safeParse(request)
		if (result.success) {
			console.log(result.data)
		} else {
			result.error.errors.forEach(async v => console.log(v))
		}
	})

	it("validate nested objects", () => {
		const createUserSchema = z.object({
			id: z.string().max(100),
			name: z.string().max(100).min(1),
			address: z.object({
				country: z.string(),
				city: z.string().optional(),
			})
		})

		type User = z.infer<typeof createUserSchema>

		const request: User = {
			id: "xxx",
			name: "irda",
			address: {
				// city: "tuban",
				country: "indonesia"
			}
		}

		const result = createUserSchema.safeParse(request)

		if (!result.success) {
			result.error.errors.forEach(async v => console.log(`${v.path.join(" -> ")} ${v.message.toLowerCase()}`))
		} else {
			console.log(result.data)
		}
	})

	it("validation array", () => {
		const strArraySchema = z.array(
			z.string().min(1).email(),
		).min(1).max(10);

		type StrArray = z.infer<typeof strArraySchema>;

		const request: StrArray = ["i@gmail.com", "j@gmail.com"];
		const result = strArraySchema.safeParse(request)

		if (!result.success) {
			result.error.errors.forEach(async v => console.log(`${v.path.join(' -> ')} ${v.message.toLowerCase()}`))
		} else {
			console.log(result.data)
		}
	})

	it("validation set", () => {
		const strSetSchema = z.set(
			z.string().email().min(1)
		).min(1).max(10);

		type StrSet = z.infer<typeof strSetSchema>

		const request: StrSet = new Set(["i@gmail.com", "i@gmail.com"])
		const result = strSetSchema.safeParse(request)

		if (!result.success) {
			result.error.errors.forEach(async v => console.log(v))
		} else {
			console.log(result.data)
		}
	})

	it("validation map", () => {
		const mapSchema = z.map(z.string(), z.string().email())
		const request = new Map<string, string>([
			["i", "i@gmail.com"],
			["j", "j@gmail.com"],
			["k", "kgmail.com"],
		])
		const result = mapSchema.safeParse(request)

		if (!result.success) {
			result.error.errors.forEach(async v => console.log(`${v.path.join(' -> ')} ${v.message.toLowerCase()}`))
		} else {
			console.log(result.data)
		}
	})


	it("validate with custom error message", () => {
		const loginSchema = z.object({
			username: z.string().email("username must email format").min(3, "minimum value is 3"),
			password: z.string().min(6, "minimum value is 6").max(10, "maximum value is 10"),
		})

		const request = {
			username: "igmail.com",
			password: "123456",
			ignore: "ignore this",
			name: "xx" // ignore
		}

		const result = loginSchema.safeParse(request)
		if (result.success) {
			console.log(result.data)
		} else {
			result.error.errors.forEach(async v => console.log(`${v.path.join(' -> ')}: ${v.message}`))
		}
	})

	it("optional fields validation", () => {
		const registerSchema = z.object({
			username: z.string().email().min(1),
			password: z.string().min(6).max(10),
			firstName: z.string().min(1).max(255),
			lastName: z.string().min(1).max(10).optional(),
		});

		type RegisterSchema = z.infer<typeof registerSchema>;

		const getRandomInt = (min: number, max: number): number => {
			min = Math.ceil(min);
			max = Math.floor(max);
			return Math.floor((Math.random() * (max - min + 1)) + min);
		}

		let request: RegisterSchema = {
			firstName: "irda",
			lastName: getRandomInt(1, 10) % 2 == 0 ? "ia" : undefined,
			username: "i@gmail.com",
			password: "123456"
		}

		let result = registerSchema.safeParse(request)
		expect(result.success).toBe(true)
		expect(result.error).toBe(undefined)
		expect(result.data).toBeTruthy()

		if (!result.success) {
			result.error.errors.forEach(async v => console.log(`${v.path.join(' -> ')}: ${v.message.toLowerCase()}`))
		} else {
			console.log(result.data)
		}
	})

	it("validate and transform data after validation", async () => {
		const schema = z.string().transform((s): string => s.toUpperCase().trim())

		const result = schema.safeParse("i@gmail.com   ")
		expect(result.success).toBeTruthy()
		expect(result.error).toBeFalsy()
		expect(result.data).toBe("I@GMAIL.COM")
	})

	it('example custom validation', () => {
		const loginSchema = z.object({
			email: z.string().email().transform((s, ctx): string => {
				if (s !== s.toUpperCase()) {
					ctx.addIssue({
						code: z.ZodIssueCode.custom,
						message: "must be uppercase"
					})
					return z.NEVER
				}

				return s
			}),
			password: z.string().min(6).max(8),
		})

		type LoginSchema = z.infer<typeof loginSchema>

		let request: LoginSchema = {
			email: "i@gmail.com",
			password: "1234578"
		}

		let result = loginSchema.safeParse(request)
		expect(result.success).toBeFalsy()
		expect(result.error?.errors.map(v => v.message).join(",")).toBe("must be uppercase")

		request = {
			email: "I@GMAIL.COM",
			password: "12345678"
		}

		result = loginSchema.safeParse(request)
		expect(result.success).toBeTruthy()
		expect(result.data).toBeTruthy()
		expect(result.data?.email).toBe("I@GMAIL.COM")

	})
})