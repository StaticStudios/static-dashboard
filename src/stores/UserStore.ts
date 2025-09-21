import {defineStore} from "pinia";
import {ref} from "vue";

function isExpired(date: number) {
    if (date === 0) {
        return true
    }
    if (isNaN(date)) {
        return true
    }
    if (date === undefined) {
        return true
    }
    return Date.now() - date > 1000 * 60 * 60 * 24 * 7
}

export const useUserStore = defineStore("userStore", () => {
    const name = ref("")
    const id = ref("")
    const token = ref("")
    const refreshToken = ref("")
    let lastModified = ref(Date.now())

    function isAuthenticated() {
        if (isExpired(lastModified.value)) {
            return false
        }

        return !!token.value
    }

    function login(newName: string, newId: string, newToken: string, nreRefreshToken: string) {
        name.value = newName
        id.value = newId
        token.value = newToken
        refreshToken.value = nreRefreshToken
        lastModified.value = Date.now()
    }

    function logout() {
        lastModified.value = 0
        token.value = ""
        refreshToken.value = ""
        name.value = ""
        id.value = ""
    }

    return {
        name,
        id,
        token,
        refreshToken,
        lastModified,
        isAuthenticated,
        login,
        logout
    }
}, {
    persist: true,
})