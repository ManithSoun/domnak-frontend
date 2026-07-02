// Format currency in USD
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Format date to readable string
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Get verdict badge color
export function getVerdictColor(verdict) {
  switch (verdict) {
    case 'fair': return 'green'
    case 'slightly_high': return 'amber'
    case 'overpriced': return 'red'
    default: return 'gray'
  }
}

// Get verdict label
export function getVerdictLabel(verdict) {
  switch (verdict) {
    case 'fair': return 'Fair'
    case 'slightly_high': return 'Slightly High'
    case 'overpriced': return 'Overpriced'
    default: return 'Unknown'
  }
}

// Calculate total from line items
export function calculateTotal(lineItems) {
  return lineItems.reduce((sum, item) => sum + item.total_price, 0)
}

// Calculate overcharge amount
export function calculateOvercharge(analysis) {
  return analysis.reduce((sum, item) => {
    if (item.verdict !== 'fair') {
      const fair = item.market_price * item.quantity
      const quoted = item.quoted_price * item.quantity
      return sum + (quoted - fair)
    }
    return sum
  }, 0)
}

// Check if user is logged in
export function isAuthenticated() {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('token')
}

// Check if user is contractor
export function isContractor() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('role') === 'contractor'
}

// Check if user is homeowner
export function isHomeowner() {
  if (typeof window === 'undefined') return false
  return localStorage.getItem('role') === 'homeowner'
}

// Truncate long text
export function truncate(text, maxLength = 50) {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}