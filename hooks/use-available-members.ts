import { useState, useEffect, useCallback, useMemo } from 'react';

// Importar tipos y utilidades centralizadas
import { Socio, RespuestaBusqueda, Paginacion } from '@/lib/types';
import { BUSQUEDA, PAGINACION } from '@/lib/constants';

// Función de debounce
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) & { cancel?: () => void } {
  let timeout: NodeJS.Timeout;
  const debouncedFn = (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
  
  debouncedFn.cancel = () => {
    clearTimeout(timeout);
  };
  
  return debouncedFn;
}


export function useAvailableMembers(idTemporada: string) {
  const [terminoBusqueda, setTerminoBusqueda] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const [socios, setSocios] = useState<Socio[]>([]);
  const [loading, setLoading] = useState(false);
  const [paginacion, setPaginacion] = useState<Paginacion | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSocios = useCallback(async (busqueda: string, pagina: number) => {
    if (!idTemporada) {
      setSocios([]);
      setPaginacion(null);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Intentar usar API primero
      const params = new URLSearchParams({
        page: pagina.toString(),
        limit: PAGINACION.TAMAÑO_PAGINA_POR_DEFECTO.toString(),
        ...(busqueda && busqueda.length >= BUSQUEDA.LONGITUD_MINIMA_BUSQUEDA && { search: busqueda })
      });

      const response = await fetch(
        `/api/socios/disponibles-para-temporada/${idTemporada}?${params}`
      );

      if (response.ok) {
        // API disponible - usar respuesta real
        const data = await response.json();

        setSocios(data.socios || []);
        setPaginacion(data.paginacion || null);
      } else {
        // Obtener mensaje de error del backend
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || 'Error en la API');
      }
    } catch (err) {
      // Mostrar el mensaje de error tal como viene del backend o del error de red
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      setSocios([]);
      setPaginacion(null);

      if (process.env.NODE_ENV === 'development') {
        console.error('[useAvailableMembers.fetchSocios]:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [idTemporada]);

  // Debounced search - espera antes de ejecutar búsqueda
  const busquedaConDebounce = useMemo(
    () => debounce((termino: string) => {
      setPaginaActual(1); // Reset a página 1 cuando busca
      fetchSocios(termino, 1);
    }, BUSQUEDA.DELAY_DEBOUNCE),
    [fetchSocios]
  );

  // Efecto para búsqueda
  useEffect(() => {
    if (terminoBusqueda.trim()) {
      // Solo buscar si el término tiene la longitud mínima
      if (terminoBusqueda.trim().length >= BUSQUEDA.LONGITUD_MINIMA_BUSQUEDA) {
        busquedaConDebounce(terminoBusqueda.trim());
      } else {
        // Si el término es muy corto, limpiar resultados
        setSocios([]);
        setPaginacion(null);
      }
    } else {
      // Si no hay término de búsqueda, cargar página actual
      fetchSocios('', paginaActual);
    }

    // Cleanup function para cancelar debounce pendiente
    return () => {
      busquedaConDebounce.cancel?.();
    };
  }, [terminoBusqueda, busquedaConDebounce, fetchSocios, paginaActual]);

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (idTemporada) {
      setPaginaActual(1);
      setTerminoBusqueda('');
      fetchSocios('', 1);
    } else {
      // Limpiar estado cuando no hay idTemporada
      setSocios([]);
      setPaginacion(null);
      setError(null);
    }
  }, [idTemporada, fetchSocios]);

  const handleCambioPagina = useCallback((pagina: number) => {
    if (pagina < 1 || (paginacion && pagina > paginacion.totalPaginas)) {
      return;
    }
    
    setPaginaActual(pagina);
    fetchSocios(terminoBusqueda.trim(), pagina);
  }, [terminoBusqueda, fetchSocios, paginacion]);

  const handleCambioBusqueda = useCallback((termino: string) => {
    // Validar longitud máxima del término de búsqueda
    if (termino.length > BUSQUEDA.LONGITUD_MAXIMA_BUSQUEDA) {
      return;
    }
    
    setTerminoBusqueda(termino);
  }, []);

  const refetch = useCallback(() => {
    fetchSocios(terminoBusqueda.trim(), paginaActual);
  }, [fetchSocios, terminoBusqueda, paginaActual]);

  // Función para limpiar búsqueda
  const limpiarBusqueda = useCallback(() => {
    setTerminoBusqueda('');
    setPaginaActual(1);
  }, []);

  // Estado derivado para facilitar el uso
  const tieneResultados = socios.length > 0;
  const tieneSiguientePagina = paginacion?.tieneSiguientePagina ?? false;
  const tieneAnteriorPagina = paginacion?.tieneAnteriorPagina ?? false;
  const totalElementos = paginacion?.totalElementos ?? 0;
  const totalPaginas = paginacion?.totalPaginas ?? 0;

  return {
    // Datos
    members: socios,
    pagination: paginacion,
    
    // Estados
    loading,
    error,
    searchTerm: terminoBusqueda,
    currentPage: paginaActual,
    
    // Estados derivados
    hasResults: tieneResultados,
    hasNextPage: tieneSiguientePagina,
    hasPreviousPage: tieneAnteriorPagina,
    totalItems: totalElementos,
    totalPages: totalPaginas,
    
    // Acciones
    setSearchTerm: handleCambioBusqueda,
    setCurrentPage: handleCambioPagina,
    refetch,
    clearSearch: limpiarBusqueda
  };
}
