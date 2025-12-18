'use client'

import { useSelectedLayoutSegments } from "next/navigation"

export function Breadcrumb() {
    const segments = useSelectedLayoutSegments()

    // Get the first segment (root section)
    const rootSegment = segments[0] || ''

    return (
        <span className="capitalize">{rootSegment.replace('-', ' ')}</span>
    )
}