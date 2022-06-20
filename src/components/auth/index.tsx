import React, { useEffect, useRef, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import * as firebaseui from 'firebaseui'
import 'firebaseui/dist/firebaseui.css'

interface Props {
  // The Firebase UI Web UI Config object.
  // See: https://github.com/firebase/firebaseui-web#configuration
  uiConfig: firebaseui.auth.Config
  // Callback that will be passed the FirebaseUi instance before it is
  // started. This allows access to certain configuration options such as
  // disableAutoSignIn().
  uiCallback?: (ui: firebaseui.auth.AuthUI) => void
  // The Firebase App auth instance to use.
  firebaseAuth: any // As firebaseui-web
  className?: string
}

const StyledFirebaseAuth: React.FC<Props> = ({ uiConfig, firebaseAuth, className, uiCallback }) => {
  // Pre-rendering has to be disabled to prevent https://github.com/preactjs/preact-cli/issues/1633

    const [userSignedIn, setUserSignedIn] = useState(false)
    const elementRef = useRef(null)

    useEffect(() => {
      // Get or Create a firebaseUI instance.
      const firebaseUiWidget = firebaseui.auth.AuthUI.getInstance() ?? new firebaseui.auth.AuthUI(firebaseAuth)
      if (uiConfig.signInFlow === 'popup') { firebaseUiWidget.reset() }

      // We track the auth state to reset firebaseUi if the user signs out.
      const unregisterAuthObserver = onAuthStateChanged(firebaseAuth, (user) => {
        if ((user == null) && userSignedIn) { firebaseUiWidget.reset() }
        setUserSignedIn(!(user == null))
      })

      // Trigger the callback if any was set.
      if (uiCallback != null) { uiCallback(firebaseUiWidget) }

      // Render the firebaseUi Widget.
      // @ts-expect-error
      firebaseUiWidget.start(elementRef.current, uiConfig)

      return () => {
        unregisterAuthObserver()
        firebaseUiWidget.reset()
      }
    }, [firebaseui, uiConfig])

    return <div className={className} ref={elementRef} />
}

export default StyledFirebaseAuth