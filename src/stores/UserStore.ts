import {defineStore} from "pinia";
import {ref} from "vue";

export const useUserStore = defineStore("userStore", () => {
    const isAuthenticated = ref(false)
    const name = ref("")
    const id = ref("")

    return {
        isAuthenticated,
        name,
        id,
    }
})