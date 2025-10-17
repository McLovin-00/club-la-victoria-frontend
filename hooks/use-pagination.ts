import { useState, useMemo } from 'react'
import { PAGINACION } from '@/lib/constants'

interface UsePaginationOptions {
  totalItems: number
  initialPage?: number
  initialPageSize?: number
}

export function usePagination({
  totalItems,
  initialPage = 1,
  initialPageSize = PAGINACION.TAMAÑO_PAGINA_POR_DEFECTO
}: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [pageSize, setPageSize] = useState(initialPageSize)

  const totalPages = Math.ceil(totalItems / pageSize)
  const startIndex = (currentPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, totalItems)

  const goToPage = (page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages))
    setCurrentPage(validPage)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize)
    setCurrentPage(1) // Reset to first page when changing page size
  }

  const paginationInfo = useMemo(() => ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex: startIndex + 1,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1
  }), [currentPage, totalPages, pageSize, totalItems, startIndex, endIndex])

  return {
    ...paginationInfo,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    setCurrentPage
  }
}
