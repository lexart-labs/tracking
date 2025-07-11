import React, { createContext } from "react";
import '@iframe-resizer/child'

const resizerContext = createContext()

function ResizerProvider({children}) {
    const [userId, setUserId] = React.useState()

    window.iFrameResizer = {
        onMessage: (event) => {
            setUserId(event)
        }
    }

    if(!userId) {
        return
    }

    return (
        <resizerContext.Provider value={{userId}}>
            {children}
        </resizerContext.Provider>
    )
} 

export { resizerContext, ResizerProvider }