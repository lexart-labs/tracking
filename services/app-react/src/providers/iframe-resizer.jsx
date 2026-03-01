import React, { createContext } from "react";
import '@iframe-resizer/child'
import sessionStore from "@/stores/session";

export const resizerContext = createContext()

function ResizerProvider({ children }) {
    const { setUser, setToken, user, token } = sessionStore()

    window.iFrameResizer = {
        onMessage: (event) => {
            if (event && (event.user || event.token)) {
                setUser(event.user || {})
                setToken(event.token || '')
            } else {
                console.warn('⚠️ Received invalid session message from parent iframe');
            }
        }
    }
    if (!user || !token) {
        console.log('⏳ Waiting for session message from parent...');
        return null;
    }

    return (
        <resizerContext.Provider value={{ user, token }}>
            {children}
        </resizerContext.Provider>
    )
}

export default ResizerProvider
