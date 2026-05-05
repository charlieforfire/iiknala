'use client'

import { useState } from 'react'
import BookModal from './BookModal'

interface Props {
  classId: string
  classTitle: string
  classDate: string
  classTime: string
  instructor: string
  isBooked: boolean
  isFull: boolean
  isLoggedIn: boolean
  hasPackage: boolean
  hasGuestCredit: boolean
}

export default function BookButton({
  classId, classTitle, classDate, classTime, instructor,
  isBooked, isFull, isLoggedIn, hasPackage, hasGuestCredit,
}: Props) {
  const [open, setOpen] = useState(false)

  if (isBooked) {
    return (
      <div className="w-full text-center py-3 rounded-xl bg-[#eef2ec] text-[#4a6741] font-medium text-sm border border-[#4a6741]/20">
        Lugar reservado ✓
      </div>
    )
  }

  if (isFull) {
    return (
      <div className="w-full text-center py-3 rounded-xl bg-stone-100 text-stone-400 font-medium text-sm">
        Clase completa
      </div>
    )
  }

  const initialStep: 'login' | 'book' = isLoggedIn ? 'book' : 'login'

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3 rounded-xl bg-[#4a6741] hover:bg-[#3a5232] text-white font-medium text-sm transition-colors"
      >
        Book
      </button>
      <BookModal
        classId={classId}
        classTitle={classTitle}
        classDate={classDate}
        classTime={classTime}
        instructor={instructor}
        isOpen={open}
        onClose={() => setOpen(false)}
        initialStep={initialStep}
        initialHasPackage={hasPackage}
        initialHasGuestCredit={hasGuestCredit}
      />
    </>
  )
}
