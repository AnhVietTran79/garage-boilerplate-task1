'use client'

import { useMemo } from 'react'
import { where } from 'firebase/firestore'
import { useCollection } from '@/hooks/useFirestore'
import { useAuth } from '@/hooks/useAuth'
import { getNotesCollection } from '@/lib/firebase/firestore'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { EmptyState } from '@/components/shared/EmptyState'

export function NotesList() {
  const { user } = useAuth()
  const uid = user?.uid ?? ''

  // useCollection re-subscribes whenever the collection reference identity changes,
  // so keep it stable per uid — a fresh ref on every render would tear the snapshot
  // listener down before the server ever answers.
  // eslint-disable-next-line react-hooks/exhaustive-deps -- uid is the resubscribe key, not a value read inside
  const notesCollection = useMemo(() => getNotesCollection(), [uid])

  const { data: notes, loading, error } = useCollection(notesCollection, where('uid', '==', uid))

  if (loading) return <LoadingSpinner />
  if (error) return <EmptyState title="Could not load notes" description={error.message} />
  if (notes.length === 0) {
    return <EmptyState title="No notes yet" description="Create your first note using the form above." />
  }

  return (
    <ul className="space-y-2">
      {notes.map((note) => (
        <li key={note.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <h3 className="font-medium">{note.title}</h3>
          <p className="mt-1 text-sm text-zinc-500 whitespace-pre-wrap">{note.body}</p>
        </li>
      ))}
    </ul>
  )
}
