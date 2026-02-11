const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export interface LoginRequest {
    email: string
    password: string
    aadhaar: string
}

export const kioskLogin = async (data: LoginRequest): Promise<string> => {
    const response = await fetch(`${BASE_URL}/api/kiosk/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText || "Login failed")
    }

    return await response.text()
}
