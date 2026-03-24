const PALETTE: Array<string> = [
    "#e06c75",
    "#61afef",
    "#98c379",
    "#e5c07b",
    "#c678dd",
    "#56b6c2",
    "#ef9a6a",
    "#ff75b5",
    "#7ee787",
    "#79c0ff",
    "#d2a8ff",
    "#ffa657",
    "#ff7b72",
    "#a5d6ff",
    "#7fc8f8",
    "#f78166",
    "#bb9af7",
    "#73daca",
    "#ff9e64",
    "#9ece6a"
]

function hashString(str: string): number {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0
    }
    return Math.abs(hash)
}

const colorCache = new Map<string, string>()

export function getUsernameColor(username: string): string {

    if (colorCache.has(username)) {
        return colorCache.get(username)!
    }

    const index = hashString(username ?? "") % PALETTE.length
    const color = PALETTE[index]!

    colorCache.set(username, color)
    return color
}

