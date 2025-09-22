import {defineStore} from "pinia";
import {useAuth, useUser} from "@clerk/vue";

export const useUserStore = defineStore("userStore", () => {
    const user = useUser();

    function getUsername() {
        return user.user.value?.fullName
    }

    function getToken() {
        return useAuth().getToken.value.name;
    }

    return {
        getUsername,
        getToken
    }
})