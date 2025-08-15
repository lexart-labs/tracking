import React, { createContext } from "react";
import '@iframe-resizer/child'
import sessionStore from "@/stores/session";

export const resizerContext = createContext()

function ResizerProvider({ children }) {
    const { setUser, setToken, user, token } = sessionStore()
    
    window.iFrameResizer = {
        onMessage: (event) => {
            setUser(event.user || {})
            setToken(event.token || '')
        }
    }
    if(!user || !token) return null

    return (
        <resizerContext.Provider value={{ user, token }}>
            {children}
        </resizerContext.Provider>
    )
}

export default ResizerProvider