import { Suspense } from 'react'
import AdminResetClient from './reset-client'

export default function AdminResetPage() {
  return (
    <Suspense fallback={null}>
      <AdminResetClient />
    </Suspense>
  )
}