const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

/**
 * Kiosk API Service.
 * Handles communication with the backend for Kiosk operations.
 */
export interface LoginRequest {
    email: string
    password: string
    aadhaar: string
}

/**
 * Authenticates the Kiosk.
 * Sends email, password, and Aadhaar for verification.
 * Returns a session token or throws an error.
 */
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
/**
 * Fetches the currently active election.
 * Requires a valid Kiosk token.
 */
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
/**
 * Fetches ballots for a specific election.
 */
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
/**
 * Fetches candidates for a specific ballot.
 */
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

// Cast vote
/**
 * Casts a vote for a candidate.
 */
export const castVote = async (electionId: string, ballotId: string, candidateId: string) => {
    const token = localStorage.getItem("kiosk_token")

    const res = await fetch(`${BASE_URL}/api/kiosk/vote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            electionId,
            ballotId,
            candidateId,
        }),
    })

    if (!res.ok) throw new Error(await res.text())
    return res.text()
}
