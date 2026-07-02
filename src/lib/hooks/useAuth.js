import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { isAuthenticated, isContractor, isHomeowner } from "@/lib/utils"

export function useAuth(requiredRole = null) {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login")
      return
    }

    if (requiredRole === "contractor" && !isContractor()) {
      router.push("/dashboard")
      return
    }

    if (requiredRole === "homeowner" && !isHomeowner()) {
      router.push("/dashboard")
      return
    }

    setUser({
      id: localStorage.getItem("user_id"),
      full_name: localStorage.getItem("full_name"),
      role: localStorage.getItem("role"),
      token: localStorage.getItem("token")
    })
    setLoading(false)
  }, [])

  return { user, loading }
}