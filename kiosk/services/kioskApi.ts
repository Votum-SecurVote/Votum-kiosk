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

// Get active election
export const getActiveElection = async () => {
    const token = localStorage.getItem("kiosk_token")

    const res = await fetch(`${BASE_URL}/api/kiosk/elections/active`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    })

    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

// Get ballots
export const getBallots = async (electionId: string) => {
    const token = localStorage.getItem("kiosk_token")

    const res = await fetch(
        `${BASE_URL}/api/kiosk/elections/${electionId}/ballots`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )

    if (!res.ok) throw new Error(await res.text())
    return res.json()
}

// Get candidates
export const getCandidates = async (ballotId: string) => {
    const token = localStorage.getItem("kiosk_token")

    const res = await fetch(
        `${BASE_URL}/api/kiosk/ballots/${ballotId}/candidates`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )

    if (!res.ok) throw new Error(await res.text())
    return res.json()
}
