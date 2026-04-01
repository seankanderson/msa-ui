import { ref } from 'vue'

/** True while a token refresh call is in flight (plus any minimum display padding). */
export const isRefreshingToken = ref(false)
