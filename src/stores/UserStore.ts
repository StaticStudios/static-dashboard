import {defineStore} from "pinia";
import {useAuth, useUser} from "@clerk/vue";

export const useUserStore = defineStore("userStore", () => {
    const user = useUser();
    const {getToken } = useAuth();

    function getUsername() {
        return user.user.value?.fullName
    }

    async function getAuthToken() {
        return await getToken.value({template: 'test'})
    }

    return {
        getUsername,
        getAuthToken
    }
})