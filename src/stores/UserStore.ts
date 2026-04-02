import {defineStore} from "pinia";
import {useAuth, useClerk, useUser} from "@clerk/vue";
import {ref} from "vue";
import axios from "axios";
import {API_BASE_URL} from "@/config/api";

export const useUserStore = defineStore("userStore", () => {
    const user = useUser();
    const {getToken} = useAuth();
    const clerk = useClerk();

    const isBackendAuthed = ref(false);
    const authCheckError = ref<string | null>(null);
    const isCheckingAuth = ref(false);
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    function getUsername() {
        return user.user.value?.fullName
    }

    async function getAuthToken() {
        return await getToken.value({template: 'test'})
    }

    async function checkUser(): Promise<boolean> {
        isCheckingAuth.value = true;
        authCheckError.value = null;

        try {
            const token = await getAuthToken();
            const response = await axios.get(`${API_BASE_URL}/api/v1/auth/check_user`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                validateStatus: () => true
            });

            if (response.status === 200) {
                isBackendAuthed.value = true;
                return true;
            } else {
                authCheckError.value = `Access denied: server returned status ${response.status}`;
                isBackendAuthed.value = false;
                await signOutUser();
                return false;
            }
        } catch (error) {
            authCheckError.value = "Failed to verify user with backend. Please try again later.";
            isBackendAuthed.value = false;
            await signOutUser();
            return false;
        } finally {
            isCheckingAuth.value = false;
        }
    }

    async function signOutUser() {
        try {
            await clerk.value?.signOut();
        } catch {
            // ignore sign out errors
        }
    }

    function startAuthPolling(intervalMs = 30000) {
        stopAuthPolling();
        pollInterval = setInterval(async () => {
            if (!isBackendAuthed.value) return;
            try {
                const token = await getAuthToken();
                const response = await axios.get(`${API_BASE_URL}/api/v1/auth/check_user`, {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    validateStatus: () => true
                });
                if (response.status !== 200) {
                    authCheckError.value = "Your access has been revoked.";
                    isBackendAuthed.value = false;
                    stopAuthPolling();
                    await signOutUser();
                }
            } catch {
                // network error during poll — don't sign out, retry next interval
            }
        }, intervalMs);
    }

    function stopAuthPolling() {
        if (pollInterval !== null) {
            clearInterval(pollInterval);
            pollInterval = null;
        }
    }

    function resetBackendAuth() {
        isBackendAuthed.value = false;
        authCheckError.value = null;
        stopAuthPolling();
    }

    return {
        getUsername,
        getAuthToken,
        checkUser,
        isBackendAuthed,
        authCheckError,
        isCheckingAuth,
        resetBackendAuth,
        startAuthPolling,
        stopAuthPolling
    }
})