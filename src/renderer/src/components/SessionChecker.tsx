import { useEffect } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

export default function SessionChecker(): null {
  const { user, logout, isAuthenticated } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || !user) {
      return
    }

    // Check user session every 30 seconds
    const checkSession = async (): Promise<void> => {
      try {
        const currentUser = await window.api.users.getById(user.id)

        // If user is deactivated or not found, logout
        if (!currentUser || !currentUser.isActive) {
          toast.error('Your account has been deactivated. Please contact an administrator.')
          logout()
          navigate('/login', { replace: true })
        }
      } catch (error) {
        console.error('Session check failed:', error)
        // If there's an error getting user info, logout for security
        logout()
        navigate('/login', { replace: true })
      }
    }

    // Initial check
    checkSession()

    // Set up interval to check every 30 seconds
    const intervalId = setInterval(checkSession, 30000)

    return () => {
      clearInterval(intervalId)
    }
  }, [user, isAuthenticated, logout, navigate])

  return null
}
