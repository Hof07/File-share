import { AlertCircle } from 'lucide-react'
import React from 'react'

function AlertMsg() {
  return (
    <div>
      <AlertCircle />
      {msg}
    </div>
  )
}

export default AlertMsg
